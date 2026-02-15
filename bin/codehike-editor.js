#!/usr/bin/env node

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the CLI
const cliPath = join(__dirname, '..', 'dist', 'cli', 'index.js');

try {
  const cli = await import(cliPath);
  cli.run();
} catch (error) {
  // If dist doesn't exist, try running from source (development mode)
  try {
    const { run } = await import('../src/cli/index.js');
    run();
  } catch (devError) {
    console.error('Error: Could not find CLI module.');
    console.error('If developing locally, run: npm run build');
    process.exit(1);
  }
}
