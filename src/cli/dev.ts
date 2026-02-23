import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import express from 'express';
import { watch } from 'chokidar';
import { createServer } from '../server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageRoot = join(__dirname, '..', '..');
const editorDistPath = join(packageRoot, 'dist', 'editor');
const srcPath = join(packageRoot, 'src');

export interface ServerOptions {
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

/** Development: serve pre-built editor with file watching and auto-rebuild. */
export async function dev(options: ServerOptions) {
  const port = parseInt(options.port, 10);
  const projectRoot = process.cwd();

  if (!existsSync(join(editorDistPath, 'index.html'))) {
    console.error('\n  Error: Pre-built editor not found.\n');
    console.error('  If you installed from npm, reinstall the package.\n');
    console.error('  If you are developing locally, run: pnpm run build\n');
    process.exit(1);
  }

  console.log('Starting codehike-editor...\n');

  const app = createServer(projectRoot);
  app.use(express.static(editorDistPath));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(join(editorDistPath, 'index.html'));
  });

  const server = listen(app, port, 'dev');

  let building = false;
  let pendingBuild = false;

  function rebuild() {
    if (building) {
      pendingBuild = true;
      return;
    }
    building = true;
    console.log('\n  Rebuilding...');
    exec('pnpm run build', { cwd: packageRoot }, (error, _stdout, stderr) => {
      if (error) {
        console.error('\n  Build failed:\n');
        console.error(stderr || error.message);
      } else {
        console.log('  Build complete.\n');
      }
      building = false;
      if (pendingBuild) {
        pendingBuild = false;
        rebuild();
      }
    });
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const watcher = watch(srcPath, { ignoreInitial: true });
  watcher.on('change', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(rebuild, 300);
  });

  console.log('  Watching for changes in src...\n');

  const shutdown = async () => {
    console.log('\nShutting down...');
    await watcher.close();
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
