import { Command } from 'commander';
import { init } from './init.js';
import { dev } from './dev.js';
import { start } from './start.js';

const program = new Command();

program
  .name('codehike-editor')
  .description('Visual editor for Code Hike-powered MDX content')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize codehike-editor in your project')
  .action(init);

program
  .command('dev')
  .description('Start the editor with Vite and HMR (for local development, e.g. when linked)')
  .option('-p, --port <port>', 'Port to run the server on', '4321')
  .action((options) => dev(options));

program
  .command('start')
  .description('Start the editor with pre-built assets (for production / when installed from npm)')
  .option('-p, --port <port>', 'Port to run the server on', '4321')
  .action((options) => start(options));

export function run() {
  program.parse();
}
