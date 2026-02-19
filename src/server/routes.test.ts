import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import express from 'express';
import request from 'supertest';
import { createRoutes } from './routes.js';

function createApp(projectRoot: string, templatesDir: string) {
  const app = express();
  app.use(express.json());
  app.use('/api', createRoutes(projectRoot, templatesDir));
  return app;
}

describe('routes', () => {
  let projectRoot: string;
  let templatesDir: string;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(join(tmpdir(), 'ch-routes-'));
    templatesDir = await fs.mkdtemp(join(tmpdir(), 'ch-tpl-'));
  });

  afterEach(async () => {
    await fs.rm(projectRoot, { recursive: true, force: true });
    await fs.rm(templatesDir, { recursive: true, force: true });
  });

  describe('GET /api/files', () => {
    it('returns MDX files from app/ dir', async () => {
      const appDir = join(projectRoot, 'app');
      await fs.mkdir(appDir, { recursive: true });
      await fs.writeFile(join(appDir, 'page.mdx'), '# Hello', 'utf-8');

      const app = createApp(projectRoot, templatesDir);
      const res = await request(app).get('/api/files');

      expect(res.status).toBe(200);
      expect(res.body.files).toHaveLength(1);
      expect(res.body.files[0].name).toBe('page.mdx');
    });

    it('handles missing app/ dir', async () => {
      const app = createApp(projectRoot, templatesDir);
      const res = await request(app).get('/api/files');

      expect(res.status).toBe(200);
      expect(res.body.files).toEqual([]);
      expect(res.body.error).toBe('No /app directory found');
    });
  });

  describe('GET /api/file/*', () => {
    it('reads file content', async () => {
      const appDir = join(projectRoot, 'app');
      await fs.mkdir(appDir, { recursive: true });
      await fs.writeFile(join(appDir, 'page.mdx'), '# Hello', 'utf-8');

      const app = createApp(projectRoot, templatesDir);
      const res = await request(app).get('/api/file/app/page.mdx');

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('# Hello');
    });

    it('rejects path traversal attempts', async () => {
      const app = createApp(projectRoot, templatesDir);
      // Express normalizes ../ in URL paths, so traversal attempts
      // result in the path not matching the /api/file/* route (404)
      const res = await request(app).get('/api/file/../../etc/passwd');

      // Express URL normalization prevents the traversal — route doesn't match
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/file/*', () => {
    it('writes file content', async () => {
      const appDir = join(projectRoot, 'app');
      await fs.mkdir(appDir, { recursive: true });

      const app = createApp(projectRoot, templatesDir);
      const res = await request(app)
        .put('/api/file/app/page.mdx')
        .send({ content: '# Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const content = await fs.readFile(join(projectRoot, 'app/page.mdx'), 'utf-8');
      expect(content).toBe('# Updated');
    });

    it('rejects missing content (400)', async () => {
      const app = createApp(projectRoot, templatesDir);
      const res = await request(app)
        .put('/api/file/app/page.mdx')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/detect-components', () => {
    it('detects components in posted content', async () => {
      const app = createApp(projectRoot, templatesDir);
      const res = await request(app)
        .post('/api/detect-components')
        .send({ content: '<Focus>code</Focus>\n<Mark />' });

      expect(res.status).toBe(200);
      expect(res.body.components).toEqual(['Focus', 'Mark']);
    });
  });

  describe('GET /api/templates', () => {
    it('lists code and layout templates', async () => {
      await fs.writeFile(join(templatesDir, 'focus.tsx'), '', 'utf-8');
      await fs.writeFile(join(templatesDir, 'mark.tsx'), '', 'utf-8');
      await fs.writeFile(join(templatesDir, 'spotlight.tsx'), '', 'utf-8');

      const app = createApp(projectRoot, templatesDir);
      const res = await request(app).get('/api/templates');

      expect(res.status).toBe(200);
      expect(res.body.code).toContain('focus');
      expect(res.body.code).toContain('mark');
      expect(res.body.layouts).toContain('spotlight');
    });
  });
});
