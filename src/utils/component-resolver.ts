import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { glob } from 'glob';
import {
  componentToFileName,
  fileNameToComponent,
  ALL_CODE_HIKE_NAMES,
  type CodeHikeComponent,
  type CodeHikeLayout
} from './component-detector.js';

export interface UserComponent {
  name: string;
  path: string;
  isCodeHikeOverride: boolean;
}

/**
 * Find all user components in the project
 */
export async function findUserComponents(
  projectRoot: string
): Promise<UserComponent[]> {
  const components: UserComponent[] = [];

  // Look in common component directories (annotations first for injected components)
  const searchPaths = [
    'components/annotations',
    'app/components',
    'components',
    'src/components'
  ];

  for (const searchPath of searchPaths) {
    const fullPath = join(projectRoot, searchPath);

    try {
      await fs.access(fullPath);
    } catch {
      continue; // Directory doesn't exist
    }

    // Find all tsx/jsx files
    const pattern = join(fullPath, '**/*.{tsx,jsx}');
    const files = await glob(pattern, { nodir: true });

    for (const file of files) {
      const fileName = basename(file, '.tsx').replace('.jsx', '');
      const componentName = fileNameToComponent(fileName);

      const isCodeHikeOverride = ALL_CODE_HIKE_NAMES.includes(
        componentName as CodeHikeComponent | CodeHikeLayout
      );

      components.push({
        name: componentName,
        path: file,
        isCodeHikeOverride
      });
    }
  }

  return components;
}

/**
 * Check if a specific Code Hike component has a user override
 */
export async function hasUserComponent(
  projectRoot: string,
  componentName: string
): Promise<string | null> {
  const fileName = componentToFileName(componentName);

  const searchPaths = [
    `components/annotations/${fileName}.tsx`,
    `components/annotations/${fileName}.jsx`,
    `app/components/${fileName}.tsx`,
    `app/components/${fileName}.jsx`,
    `components/${fileName}.tsx`,
    `components/${fileName}.jsx`,
    `src/components/${fileName}.tsx`,
    `src/components/${fileName}.jsx`
  ];

  for (const searchPath of searchPaths) {
    const fullPath = join(projectRoot, searchPath);
    try {
      await fs.access(fullPath);
      return fullPath;
    } catch {
      continue;
    }
  }

  return null;
}

