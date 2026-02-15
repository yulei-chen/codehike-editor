import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import { join, relative, dirname } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { detectComponents } from '../utils/component-detector.js';
import { findUserComponents } from '../utils/component-resolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createRoutes(projectRoot: string): Router {
  const router = Router();

  // GET /api/files - List all MDX files in /app directory
  router.get('/files', async (_req: Request, res: Response) => {
    try {
      const appDir = join(projectRoot, 'app');

      // Check if app directory exists
      try {
        await fs.access(appDir);
      } catch {
        return res.json({ files: [], error: 'No /app directory found' });
      }

      // Find all MDX files
      const pattern = join(appDir, '**/*.mdx');
      const files = await glob(pattern, { nodir: true });

      // Convert to relative paths
      const relativePaths = files.map((file) => ({
        path: relative(projectRoot, file),
        name: relative(appDir, file)
      }));

      // Sort alphabetically
      relativePaths.sort((a, b) => a.name.localeCompare(b.name));

      res.json({ files: relativePaths });
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  });

  // GET /api/file/:path - Read file content
  router.get('/file/*', async (req: Request, res: Response) => {
    try {
      const filePath = req.params[0];
      if (!filePath) {
        return res.status(400).json({ error: 'File path required' });
      }

      const fullPath = join(projectRoot, filePath);

      // Security check: ensure path is within project
      if (!fullPath.startsWith(projectRoot)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      res.json({ content, path: filePath });
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Failed to read file' });
    }
  });

  // PUT /api/file/:path - Write file content
  router.put('/file/*', async (req: Request, res: Response) => {
    try {
      const filePath = req.params[0];
      if (!filePath) {
        return res.status(400).json({ error: 'File path required' });
      }

      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'Content required' });
      }

      const fullPath = join(projectRoot, filePath);

      // Security check: ensure path is within project
      if (!fullPath.startsWith(projectRoot)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Ensure directory exists
      await fs.mkdir(dirname(fullPath), { recursive: true });

      await fs.writeFile(fullPath, content, 'utf-8');
      res.json({ success: true, path: filePath });
    } catch (error) {
      console.error('Error writing file:', error);
      res.status(500).json({ error: 'Failed to write file' });
    }
  });

  // GET /api/components - List user's existing components
  router.get('/components', async (_req: Request, res: Response) => {
    try {
      const userComponents = await findUserComponents(projectRoot);
      res.json({ components: userComponents });
    } catch (error) {
      console.error('Error listing components:', error);
      res.status(500).json({ error: 'Failed to list components' });
    }
  });

  // POST /api/detect-components - Detect components used in MDX content
  router.post('/detect-components', async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'Content required' });
      }

      const components = detectComponents(content);
      res.json({ components });
    } catch (error) {
      console.error('Error detecting components:', error);
      res.status(500).json({ error: 'Failed to detect components' });
    }
  });

  // POST /api/inject - Inject selected components into user's project
  router.post('/inject', async (req: Request, res: Response) => {
    try {
      const { components } = req.body;
      if (!Array.isArray(components)) {
        return res.status(400).json({ error: 'Components array required' });
      }

      const templatesDir = join(__dirname, '..', 'templates');
      const targetDir = join(projectRoot, 'app', 'components');

      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });

      const injected: string[] = [];
      const skipped: string[] = [];
      const failed: string[] = [];

      for (const componentName of components) {
        // Normalize component name to lowercase for file lookup
        const normalizedName = componentName.toLowerCase().replace(/\s+/g, '-');

        // Check if user already has this component
        const targetPath = join(targetDir, `${normalizedName}.tsx`);
        try {
          await fs.access(targetPath);
          skipped.push(componentName);
          continue;
        } catch {
          // File doesn't exist, proceed with injection
        }

        // Find the template
        const codeTemplatePath = join(templatesDir, 'code', `${normalizedName}.tsx`);
        const layoutTemplatePath = join(templatesDir, 'layouts', `${normalizedName}.tsx`);

        let templatePath: string | null = null;
        try {
          await fs.access(codeTemplatePath);
          templatePath = codeTemplatePath;
        } catch {
          try {
            await fs.access(layoutTemplatePath);
            templatePath = layoutTemplatePath;
          } catch {
            failed.push(componentName);
            continue;
          }
        }

        // Copy template to user's project
        try {
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          await fs.writeFile(targetPath, templateContent, 'utf-8');
          injected.push(componentName);
        } catch {
          failed.push(componentName);
        }
      }

      res.json({ injected, skipped, failed });
    } catch (error) {
      console.error('Error injecting components:', error);
      res.status(500).json({ error: 'Failed to inject components' });
    }
  });

  // GET /api/templates - List available Code Hike templates
  router.get('/templates', async (_req: Request, res: Response) => {
    try {
      const templatesDir = join(__dirname, '..', 'templates');

      const codeTemplates: string[] = [];
      const layoutTemplates: string[] = [];

      // Read code templates
      try {
        const codeDir = join(templatesDir, 'code');
        const codeFiles = await fs.readdir(codeDir);
        codeTemplates.push(
          ...codeFiles
            .filter((f) => f.endsWith('.tsx'))
            .map((f) => f.replace('.tsx', ''))
        );
      } catch {
        // Directory might not exist
      }

      // Read layout templates
      try {
        const layoutDir = join(templatesDir, 'layouts');
        const layoutFiles = await fs.readdir(layoutDir);
        layoutTemplates.push(
          ...layoutFiles
            .filter((f) => f.endsWith('.tsx'))
            .map((f) => f.replace('.tsx', ''))
        );
      } catch {
        // Directory might not exist
      }

      res.json({
        code: codeTemplates,
        layouts: layoutTemplates
      });
    } catch (error) {
      console.error('Error listing templates:', error);
      res.status(500).json({ error: 'Failed to list templates' });
    }
  });

  // GET /api/template/:type/:name - Get template content and snippet
  router.get('/template/:type/:name', async (req: Request, res: Response) => {
    try {
      const { type, name } = req.params;

      if (!['code', 'layouts'].includes(type)) {
        return res.status(400).json({ error: 'Invalid template type' });
      }

      const templatesDir = join(__dirname, '..', 'templates');
      const templatePath = join(templatesDir, type, `${name}.tsx`);

      try {
        const content = await fs.readFile(templatePath, 'utf-8');

        // Extract the MDX snippet from the template comment
        const snippetMatch = content.match(/\/\*\s*MDX Snippet:\s*([\s\S]*?)\*\//);
        const snippet = snippetMatch ? snippetMatch[1].trim() : '';

        res.json({ content, snippet, name, type });
      } catch {
        res.status(404).json({ error: 'Template not found' });
      }
    } catch (error) {
      console.error('Error reading template:', error);
      res.status(500).json({ error: 'Failed to read template' });
    }
  });

  return router;
}
