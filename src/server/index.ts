import express, { Express } from 'express';
import cors from 'cors';
import { createRoutes } from './routes.js';

export function createServer(projectRoot: string): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api', createRoutes(projectRoot));

  return app;
}
