import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import { createRoutes } from './routes.js';

// tsup bundles server code into dist/chunk-*.js, so __dirname can be dist/ or dist/server/
// We need dist/templates in both cases
const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR =
  basename(__dirname) === 'server'
    ? join(__dirname, '..', 'templates')
    : join(__dirname, 'templates');

export function createServer(projectRoot: string): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api', createRoutes(projectRoot, TEMPLATES_DIR));

  return app;
}
