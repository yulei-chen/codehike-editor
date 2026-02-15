import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import { createRoutes } from './routes.js';

// Resolve templates from this entry file so path is correct when bundled (dist/server/index.js)
const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

export function createServer(projectRoot: string): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api', createRoutes(projectRoot, TEMPLATES_DIR));

  return app;
}
