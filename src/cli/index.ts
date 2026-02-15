import { Command } from 'commander';
import { init } from './init.js';
import { dev } from './dev.js';

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
  .description('Start the editor development server')
  .option('-p, --port <port>', 'Port to run the server on', '4321')
  .action((options) => dev(options));

export function run() {
  program.parse();
}
