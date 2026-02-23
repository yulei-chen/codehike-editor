import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import { createServer } from '../server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageRoot = join(__dirname, '..', '..');
const editorDistPath = join(packageRoot, 'dist', 'editor');

export interface StartOptions {
  port: string;
}

function listen(app: express.Express, port: number, command: string) {
  const server = app.listen(port, () => {
    console.log(`\n  codehike-editor running at:\n`);
    console.log(`  ➜  Local:   http://localhost:${port}/\n`);
    console.log(`  Press Ctrl+C to stop\n`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  Error: Port ${port} is already in use.\n`);
      console.error(`  Try running with a different port: codehike-editor ${command} -p ${port + 1}\n`);
      process.exit(1);
    }
    throw err;
  });

  return server;
}

/** Production: serve pre-built editor. Use when installed from npm. */
export async function start(options: StartOptions) {
  const port = parseInt(options.port, 10);
  const projectRoot = process.cwd();

  if (!existsSync(join(editorDistPath, 'index.html'))) {
    console.error('\n  Error: Pre-built editor not found.\n');
    console.error('  If you installed from npm, reinstall the package.\n');
    console.error('  If you are developing locally, run: pnpm run build:editor\n');
    process.exit(1);
  }

  console.log('Starting codehike-editor...\n');

  const app = createServer(projectRoot);
  app.use(express.static(editorDistPath));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(join(editorDistPath, 'index.html'));
  });

  const server = listen(app, port, 'start');

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    server.close();
    process.exit(0);
  });
}
