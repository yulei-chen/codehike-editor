import { promises as fs } from 'fs';
import { join, dirname } from 'path';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file, returning null if it doesn't exist
 */
export async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write a file, creating parent directories if needed
 */
export async function writeFileSafe(
  filePath: string,
  content: string
): Promise<boolean> {
  try {
    await fs.mkdir(dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * List files in a directory matching a pattern
 */
export async function listFiles(
  dir: string,
  extension?: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        if (!extension || entry.name.endsWith(extension)) {
          files.push(join(dir, entry.name));
        }
      }
    }

    return files;
  } catch {
    return [];
  }
}

/**
 * Recursively list files in a directory
 */
export async function listFilesRecursive(
  dir: string,
  extension?: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await listFilesRecursive(fullPath, extension);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        if (!extension || entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  } catch {
    return [];
  }
}
