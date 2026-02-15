import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from '../server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DevOptions {
  port: string;
}

export async function dev(options: DevOptions) {
  const port = parseInt(options.port, 10);
  const projectRoot = process.cwd();

  console.log('Starting codehike-editor...\n');

  // Find the editor root directory (src/editor when running from dist/cli)
  const packageRoot = join(__dirname, '..', '..');
  const editorRoot = join(packageRoot, 'src', 'editor');

  // Create Express server
  const app = createServer(projectRoot);

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    root: editorRoot,
    configFile: join(editorRoot, 'vite.config.ts'),
    server: {
      middlewareMode: true,
      hmr: {
        port: port + 1
      }
    },
    appType: 'spa',
    define: {
      'import.meta.env.VITE_PROJECT_ROOT': JSON.stringify(projectRoot)
    }
  });

  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);

  // Start the server
  const server = app.listen(port, () => {
    console.log(`\n  codehike-editor running at:\n`);
    console.log(`  ➜  Local:   http://localhost:${port}/\n`);
    console.log(`  Press Ctrl+C to stop\n`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  Error: Port ${port} is already in use.\n`);
      console.error(`  Try running with a different port: codehike-editor dev -p ${port + 1}\n`);
      process.exit(1);
    }
    throw err;
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await vite.close();
    server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await vite.close();
    server.close();
    process.exit(0);
  });
}
