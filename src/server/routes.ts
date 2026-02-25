import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import { join, relative, dirname } from 'path';
import { glob } from 'glob';
import { detectComponents } from '../utils/component-detector.js';
import { findUserComponents } from '../utils/component-resolver.js';
import { ensureCodeComponent, isHandlerAlreadyAdded, ensureMdxRegistration, ensureCodeWrappers } from '../utils/code-component-manager.js';

const HOVER_CSS_MARKER = '/* codehike:code-mentions */';
const HOVER_CSS = `
${HOVER_CSS_MARKER}
.hover-container [data-line] {
  transition: opacity 0.2s;
}
.hover-container:has([data-hover]:hover) [data-line] {
  opacity: 0.3;
}
.hover-container:has([data-hover]:hover) [data-line=""] {
  opacity: 0.3;
}
`;

// Generate CSS rules that restore opacity for matching hover names.
// Uses CSS :has() — each hover name needs its own rule.
function generateHoverMatchRules(names: string[]): string {
  return names
    .map(
      (n) =>
        `.hover-container:has([data-hover="${n}"]:hover) [data-line="${n}"] { opacity: 1; }`
    )
    .join('\n');
}

const DEFAULT_HOVER_NAMES = [
  'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten'
];

/**
 * Append code-mentions hover CSS to the project's globals.css (or app/globals.css).
 */
async function ensureHoverStyles(projectRoot: string) {
  // Try common global CSS locations
  const candidates = [
    join(projectRoot, 'app', 'globals.css'),
    join(projectRoot, 'styles', 'globals.css'),
    join(projectRoot, 'app', 'global.css'),
  ];

  let cssPath: string | null = null;
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      cssPath = candidate;
      break;
    } catch {
      // Try next
    }
  }

  if (!cssPath) {
    // Create app/globals.css
    cssPath = candidates[0];
    await fs.mkdir(dirname(cssPath), { recursive: true });
    await fs.writeFile(cssPath, '', 'utf-8');
  }

  const content = await fs.readFile(cssPath, 'utf-8');

  // Already added
  if (content.includes(HOVER_CSS_MARKER)) return;

  const matchRules = generateHoverMatchRules(DEFAULT_HOVER_NAMES);
  await fs.writeFile(cssPath, content + HOVER_CSS + matchRules + '\n', 'utf-8');
}

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
  router.get('/file/*filePath', async (req: Request, res: Response) => {
    try {
      const rawPath = req.params.filePath;
      const filePath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath as string;
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
  router.put('/file/*filePath', async (req: Request, res: Response) => {
    try {
      const rawPath = req.params.filePath;
      const filePath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath as string;
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

  // Companion files that must be copied alongside a template
  const COMPANION_FILES: Record<string, string[]> = {
    'focus': ['focus.client.tsx'],
    'token-transitions': ['smooth-pre.tsx'],
    'tabs': ['tabs.client.tsx'],
    'language-switcher': ['language-switcher.client.tsx'],
  };

  // Templates that require other templates to also be injected
  const TEMPLATE_DEPENDENCIES: Record<string, string[]> = {
    'diff': ['mark'],
  };

  // POST /api/inject - Inject selected components into user's project
  router.post('/inject', async (req: Request, res: Response) => {
    try {
      const { components } = req.body;
      if (!Array.isArray(components)) {
        return res.status(400).json({ error: 'Components array required' });
      }

      const targetDir = join(projectRoot, 'app','components');
      const templatesDir = join(projectRoot, 'node_modules', 'codehike-editor', 'dist', 'templates');

      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });

      const injected: string[] = [];
      const skipped: string[] = [];
      const failed: string[] = [];

      // Expand components list with any required dependencies
      const allComponents = [...components];
      for (const name of components) {
        const normalized = name.toLowerCase().replace(/\s+/g, '-');
        for (const dep of TEMPLATE_DEPENDENCIES[normalized] || []) {
          if (!allComponents.some(c => c.toLowerCase().replace(/\s+/g, '-') === dep)) {
            allComponents.push(dep);
          }
        }
      }

      for (const componentName of allComponents) {
        // Normalize component name to lowercase for file lookup
        const normalizedName = componentName.toLowerCase().replace(/\s+/g, '-');

        // Check if handler is already registered in code.tsx
        const alreadyAdded = await isHandlerAlreadyAdded(targetDir, templatesDir, normalizedName);
        if (alreadyAdded) {
          skipped.push(componentName);
          continue;
        }

        // Find the template (all templates are in templates/ root)
        const templatePath = join(templatesDir, `${normalizedName}.tsx`);
        try {
          await fs.access(templatePath);
        } catch {
          failed.push(componentName, templatePath);
          continue;
        }

        // Copy template to user's project
        const targetPath = join(targetDir, `${normalizedName}.tsx`);
        try {
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          await fs.writeFile(targetPath, templateContent, 'utf-8');
          injected.push(componentName);

          // Copy companion files if any
          const companions = COMPANION_FILES[normalizedName];
          if (companions) {
            for (const companion of companions) {
              const companionSrc = join(templatesDir, companion);
              const companionDst = join(targetDir, companion);
              try {
                const companionContent = await fs.readFile(companionSrc, 'utf-8');
                await fs.writeFile(companionDst, companionContent, 'utf-8');
              } catch {
                // Non-fatal: companion file missing
              }
            }
          }
        } catch {
          failed.push(componentName, targetPath);
        }
      }

      // All requested component names (including skipped ones and dependencies)
      const allRequestedNames = allComponents.map((n: string) => n.toLowerCase().replace(/\s+/g, '-'));

      // Auto-create/update code.tsx with annotation handler imports
      const injectedFileNames = injected.map(name => name.toLowerCase().replace(/\s+/g, '-'));
      let codeTsx: 'created' | 'updated' | 'unchanged' = 'unchanged';
      try {
        codeTsx = await ensureCodeComponent(targetDir, templatesDir, injectedFileNames);
      } catch (err) {
        console.error('Error managing code.tsx:', err);
      }

      // Auto-add wrapper components (e.g. CopyButton) to code.tsx
      try {
        await ensureCodeWrappers(targetDir, allRequestedNames);
      } catch (err) {
        console.error('Error adding code wrappers:', err);
      }

      // Auto-register MDX components (e.g. HoverContainer, Link) in mdx-components.tsx
      let mdxRegistration: 'created' | 'updated' | 'unchanged' = 'unchanged';
      try {
        mdxRegistration = await ensureMdxRegistration(projectRoot, targetDir, allRequestedNames);
      } catch (err) {
        console.error('Error updating mdx-components.tsx:', err);
      }

      // Add hover CSS if code-mentions was requested
      if (allRequestedNames.includes('code-mentions')) {
        try {
          await ensureHoverStyles(projectRoot);
        } catch (err) {
          console.error('Error adding hover styles:', err);
        }
      }

      res.json({ injected, skipped, failed, codeTsx, mdxRegistration });
    } catch (error) {
      console.error('Error injecting components:', error);
      res.status(500).json({ error: 'Failed to inject components' });
    }
  });

  // Layout template names (all other .tsx in templates/ are code templates)
  const LAYOUT_TEMPLATE_NAMES = ['spotlight', 'slideshow', 'scrollycoding'];

  // GET /api/templates - List available Code Hike templates
  router.get('/templates', async (_req: Request, res: Response) => {
    try {
      const templatesDir = join(projectRoot, 'node_modules', 'codehike-editor', 'dist', 'templates');
      const files = await fs.readdir(templatesDir);
      const allTemplates = files
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => f.replace('.tsx', ''));

      const layoutTemplates = allTemplates.filter((name) =>
        LAYOUT_TEMPLATE_NAMES.includes(name)
      );
      const codeTemplates = allTemplates.filter(
        (name) => !LAYOUT_TEMPLATE_NAMES.includes(name)
      );

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
      const { type, name } = req.params as { type: string; name: string };

      if (!['code', 'layouts'].includes(type)) {
        return res.status(400).json({ error: 'Invalid template type' });
      }

      const templatesDir = join(projectRoot, 'node_modules', 'codehike-editor', 'dist', 'templates');
      const templatePath = join(templatesDir, `${name}.tsx`);

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
