import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export async function init() {
  const cwd = process.cwd();
  const packageJsonPath = join(cwd, 'package.json');

  console.log('Initializing codehike-editor...\n');

  // Check if package.json exists
  if (!existsSync(packageJsonPath)) {
    console.error('Error: No package.json found in current directory.');
    console.error('Please run this command from the root of your project.');
    process.exit(1);
  }

  // Read and parse package.json
  let packageJson: Record<string, unknown>;
  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(content);
  } catch (error) {
    console.error('Error: Could not parse package.json.');
    process.exit(1);
  }

  // Check if Code Hike is installed
  const dependencies = packageJson.dependencies as Record<string, string> | undefined;
  const devDependencies = packageJson.devDependencies as Record<string, string> | undefined;

  const hasCodeHike =
    dependencies?.codehike ||
    devDependencies?.codehike;

  if (!hasCodeHike) {
    console.error('Error: Code Hike is not installed in this project.\n');
    console.error('Please install Code Hike first:');
    console.error('  https://codehike.org/docs\n');
    process.exit(1);
  }

  console.log('✓ Code Hike detected\n');

  // Add codehike-editor as dev dependency
  if (!devDependencies?.['codehike-editor']) {
    console.log('Adding codehike-editor as dev dependency...');

    // Detect package manager
    const hasYarnLock = existsSync(join(cwd, 'yarn.lock'));
    const hasPnpmLock = existsSync(join(cwd, 'pnpm-lock.yaml'));
    const hasBunLock = existsSync(join(cwd, 'bun.lockb'));

    let installCmd: string;
    if (hasPnpmLock) {
      installCmd = 'pnpm add -D codehike-editor';
    } else if (hasYarnLock) {
      installCmd = 'yarn add -D codehike-editor';
    } else if (hasBunLock) {
      installCmd = 'bun add -D codehike-editor';
    } else {
      // Default to npm
      installCmd = 'npm install -D codehike-editor';
    }

    try {
      execSync(installCmd, { stdio: 'inherit', cwd });
      console.log('✓ codehike-editor added as dev dependency\n');
    } catch (error) {
      // If install fails (e.g., package not published yet), add it manually
      console.log('Note: Could not install from registry. Adding to package.json manually...');

      const updatedPackageJson = {
        ...packageJson,
        devDependencies: {
          ...devDependencies,
          'codehike-editor': '^0.1.0'
        }
      };
      writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2) + '\n');
      console.log('✓ codehike-editor added to devDependencies\n');
    }

    // Re-read package.json after modification
    const updatedContent = readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(updatedContent);
  } else {
    console.log('✓ codehike-editor already in devDependencies\n');
  }

  // Add editor scripts to package.json
  const scripts = (packageJson.scripts as Record<string, string>) || {};
  const updates: Record<string, string> = {};

  if (!scripts.editor) {
    updates.editor = 'codehike-editor start';
    console.log('Adding "editor" script (codehike-editor start)...');
  }

  if (Object.keys(updates).length > 0) {
    const updatedPackageJson = {
      ...packageJson,
      scripts: { ...scripts, ...updates }
    };
    writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2) + '\n');
    console.log('✓ Scripts added\n');
  } else {
    console.log('✓ Editor scripts already exist\n');
  }

  // Detect package manager for final message
  const hasYarnLock = existsSync(join(cwd, 'yarn.lock'));
  const hasPnpmLock = existsSync(join(cwd, 'pnpm-lock.yaml'));
  const hasBunLock = existsSync(join(cwd, 'bun.lockb'));

  let runCmd = 'npm run editor';
  if (hasYarnLock) {
    runCmd = 'yarn editor';
  } else if (hasBunLock) {
    runCmd = 'bun run editor';
  } else if (hasPnpmLock) {
    runCmd = 'pnpm run editor';
  }

  console.log('Setup complete!\n');
  console.log('Run the editor:');
  console.log(`  ${runCmd}          # production (pre-built)`);
  console.log(`  ${runCmd.replace(' editor', ' editor:dev')}   # dev with HMR (when linked)\n`);
}
