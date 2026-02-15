import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from '../server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageRoot = join(__dirname, '..', '..');
const editorRoot = join(packageRoot, 'src', 'editor');

export interface ServerOptions {
  port: string;
}

function listen(app: ReturnType<typeof createServer>, port: number, command: string) {
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

/** Development: Vite + HMR from source. Use when linked for local dev. */
export async function dev(options: ServerOptions) {
  const port = parseInt(options.port, 10);
  const projectRoot = process.cwd();

  console.log('Starting codehike-editor (dev mode with HMR)...\n');

  const app = createServer(projectRoot);
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
  app.use(vite.middlewares);

  const server = listen(app, port, 'dev');

  const shutdown = async () => {
    await vite.close();
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await shutdown();
  });
  process.on('SIGTERM', shutdown);
}
