import { promises as fs } from 'fs';
import { join, relative } from 'path';

interface HandlerInfo {
  fileName: string;
  exportNames: string[];
}

interface MdxComponentInfo {
  fileName: string;
  componentName: string;
  registerAs: string; // the key in useMDXComponents (e.g. "a" for Link)
}

// Templates that export MDX components needing registration in mdx-components.tsx.
// registerAs is the MDX component name (use the export name itself, or a custom key like "a" for links).
const MDX_COMPONENT_REGISTRY: Record<string, MdxComponentInfo[]> = {
  'code-mentions': [
    { fileName: 'code-mentions', componentName: 'HoverContainer', registerAs: 'HoverContainer' },
    { fileName: 'code-mentions', componentName: 'Link', registerAs: 'a' },
  ],
};

/**
 * Parse a template file to extract AnnotationHandler export names.
 */
export function extractHandlerExports(content: string): string[] {
  const regex = /export const (\w+)\s*:\s*AnnotationHandler\b/g;
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    names.push(match[1]);
  }
  return names;
}

/**
 * Read the user's code.tsx and return all handler names already present
 * (detected by looking at the handlers={[...]} array).
 */
export async function getExistingHandlers(targetDir: string): Promise<string[]> {
  const codeFilePath = join(targetDir, 'code.tsx');
  let content: string;
  try {
    content = await fs.readFile(codeFilePath, 'utf-8');
  } catch {
    return [];
  }

  const handlersPattern = /handlers[=:]\s*\{?\[([^\]]*)\]/;
  const match = content.match(handlersPattern);
  if (!match) return [];

  return match[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Check whether a template's annotation handlers are already in code.tsx.
 * Returns true if ALL handler exports from the template are already present.
 */
export async function isHandlerAlreadyAdded(
  targetDir: string,
  templatesDir: string,
  normalizedName: string
): Promise<boolean> {
  const templatePath = join(templatesDir, `${normalizedName}.tsx`);
  let templateContent: string;
  try {
    templateContent = await fs.readFile(templatePath, 'utf-8');
  } catch {
    return false;
  }

  const exportNames = extractHandlerExports(templateContent);
  if (exportNames.length === 0) {
    // Not an annotation handler — check if it's a wrapper component already in code.tsx
    const wrapper = CODE_WRAPPER_REGISTRY[normalizedName];
    if (wrapper) {
      const codeFilePath = join(targetDir, 'code.tsx');
      try {
        const codeContent = await fs.readFile(codeFilePath, 'utf-8');
        return codeContent.includes(wrapper.importName);
      } catch {
        return false;
      }
    }
    return false;
  }

  const existing = await getExistingHandlers(targetDir);
  return exportNames.every(name => existing.includes(name));
}

/**
 * Generate a fresh code.tsx file content from handler info.
 */
function generateCodeComponent(handlers: HandlerInfo[]): string {
  const imports = ['import { Pre, RawCode, highlight } from "codehike/code"'];
  const allHandlerNames: string[] = [];

  for (const handler of handlers) {
    const importNames = handler.exportNames.join(', ');
    imports.push(`import { ${importNames} } from "./${handler.fileName}"`);
    allHandlerNames.push(...handler.exportNames);
  }

  const handlersArray = allHandlerNames.join(', ');

  return `${imports.join('\n')}

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, "github-dark")
  return <Pre code={highlighted} handlers={[${handlersArray}]} />
}
`;
}

/**
 * Update an existing code.tsx file to add new handler imports and handler names.
 */
function updateCodeComponent(existingContent: string, handlers: HandlerInfo[]): string {
  let content = existingContent;

  for (const handler of handlers) {
    // Check which exports are already imported
    const newExports = handler.exportNames.filter(name => {
      const importRegex = new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`);
      return !importRegex.test(content);
    });

    if (newExports.length === 0) continue;

    // Add import after the last import line
    const importStatement = `import { ${newExports.join(', ')} } from "./${handler.fileName}"`;
    const lastImportIndex = content.lastIndexOf('\nimport ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex + 1);
      content = content.slice(0, endOfLine) + '\n' + importStatement + content.slice(endOfLine);
    } else {
      content = importStatement + '\n' + content;
    }

    // Add handler names to the handlers array
    for (const name of newExports) {
      const handlersPattern = /(handlers[=:]\s*\{?\[)([^\]]*?)(\])/;
      const match = content.match(handlersPattern);
      if (match) {
        const existing = match[2].trim();
        const newList = existing ? `${existing}, ${name}` : name;
        content = content.replace(handlersPattern, `$1${newList}$3`);
      }
    }
  }

  return content;
}

/**
 * Ensure a code.tsx component exists in targetDir with all injected annotation handlers.
 * Returns 'created', 'updated', or 'unchanged'.
 */
export async function ensureCodeComponent(
  targetDir: string,
  templatesDir: string,
  injectedFileNames: string[]
): Promise<'created' | 'updated' | 'unchanged'> {
  const handlers: HandlerInfo[] = [];

  for (const fileName of injectedFileNames) {
    const templatePath = join(templatesDir, `${fileName}.tsx`);
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      const exportNames = extractHandlerExports(content);
      if (exportNames.length > 0) {
        handlers.push({ fileName, exportNames });
      }
    } catch {
      // Template not readable, skip
    }
  }

  if (handlers.length === 0) {
    return 'unchanged';
  }

  const codeFilePath = join(targetDir, 'code.tsx');

  let existingContent: string | null = null;
  try {
    existingContent = await fs.readFile(codeFilePath, 'utf-8');
  } catch {
    // File doesn't exist
  }

  if (existingContent === null) {
    const content = generateCodeComponent(handlers);
    await fs.writeFile(codeFilePath, content, 'utf-8');
    return 'created';
  } else {
    const updated = updateCodeComponent(existingContent, handlers);
    if (updated === existingContent) {
      return 'unchanged';
    }
    await fs.writeFile(codeFilePath, updated, 'utf-8');
    return 'updated';
  }
}

interface CodeWrapperInfo {
  fileName: string;
  importName: string;
  // Transform applied to code.tsx: wraps the return statement
  wrapReturn: (preJsx: string) => string;
}

// Templates that modify the code.tsx return (wrapping <Pre>), not annotation handlers.
const CODE_WRAPPER_REGISTRY: Record<string, CodeWrapperInfo> = {
  'copy-button': {
    fileName: 'copy-button',
    importName: 'CopyButton',
    wrapReturn: (preJsx: string) =>
      `<div className="relative">\n      <CopyButton text={highlighted.code} />\n      ${preJsx}\n    </div>`,
  },
};

/**
 * Ensure code.tsx includes wrapper components (e.g. CopyButton) for requested templates.
 * Adds import and wraps the <Pre> return.
 */
export async function ensureCodeWrappers(
  targetDir: string,
  requestedNames: string[]
): Promise<'updated' | 'unchanged'> {
  const wrappers: CodeWrapperInfo[] = [];
  for (const name of requestedNames) {
    const wrapper = CODE_WRAPPER_REGISTRY[name];
    if (wrapper) wrappers.push(wrapper);
  }
  if (wrappers.length === 0) return 'unchanged';

  const codeFilePath = join(targetDir, 'code.tsx');
  let content: string;
  try {
    content = await fs.readFile(codeFilePath, 'utf-8');
  } catch {
    return 'unchanged'; // code.tsx doesn't exist yet
  }

  let changed = false;

  for (const wrapper of wrappers) {
    // Skip if already imported
    if (content.includes(wrapper.importName)) continue;

    changed = true;

    // Add import
    const importLine = `import { ${wrapper.importName} } from "./${wrapper.fileName}"`;
    const lastImportIndex = content.lastIndexOf('\nimport ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex + 1);
      content = content.slice(0, endOfLine) + '\n' + importLine + content.slice(endOfLine);
    } else {
      content = importLine + '\n' + content;
    }

    // Wrap the return: find `return <Pre .../>` or `return (\n    <Pre .../>\n  )`
    // Match return with <Pre .../> (self-closing)
    const returnPrePattern = /(return\s*(?:\(\s*)?)(<Pre\b[^]*?\/>)(\s*\)?)/;
    const match = content.match(returnPrePattern);
    if (match) {
      const preJsx = match[2];
      const wrapped = wrapper.wrapReturn(preJsx);
      content = content.replace(
        returnPrePattern,
        `return (\n    ${wrapped}\n  )`
      );
    }
  }

  if (!changed) return 'unchanged';

  await fs.writeFile(codeFilePath, content, 'utf-8');
  return 'updated';
}

/**
 * Ensure mdx-components.tsx registers any MDX components exported by injected templates.
 * Works like ensureCodeComponent but for MDX component registration.
 */
export async function ensureMdxRegistration(
  projectRoot: string,
  targetDir: string,
  injectedFileNames: string[]
): Promise<'created' | 'updated' | 'unchanged'> {
  // Collect all MDX components that need registration
  const toRegister: MdxComponentInfo[] = [];
  for (const fileName of injectedFileNames) {
    const entries = MDX_COMPONENT_REGISTRY[fileName];
    if (entries) {
      toRegister.push(...entries);
    }
  }

  if (toRegister.length === 0) {
    return 'unchanged';
  }

  const mdxPath = join(projectRoot, 'mdx-components.tsx');
  const rel = relative(projectRoot, targetDir).replace(/\\/g, '/');

  let content: string;
  try {
    content = await fs.readFile(mdxPath, 'utf-8');
  } catch {
    // No mdx-components.tsx — create one
    const imports: string[] = ['import type { MDXComponents } from "mdx/types"'];
    const entries: string[] = ['    ...components'];

    // Group by fileName
    const byFile = new Map<string, MdxComponentInfo[]>();
    for (const info of toRegister) {
      const list = byFile.get(info.fileName) || [];
      list.push(info);
      byFile.set(info.fileName, list);
    }

    for (const [fileName, infos] of byFile) {
      const names = infos.map(i => i.componentName).join(', ');
      imports.push(`import { ${names} } from "./${rel}/${fileName}"`);
      for (const info of infos) {
        if (info.registerAs === info.componentName) {
          entries.push(`    ${info.componentName}`);
        } else {
          entries.push(`    ${info.registerAs}: ${info.componentName}`);
        }
      }
    }

    content = `${imports.join('\n')}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
${entries.join(',\n')},
  }
}
`;
    await fs.writeFile(mdxPath, content, 'utf-8');
    return 'created';
  }

  // File exists — add missing imports and registrations
  let changed = false;

  for (const info of toRegister) {
    // Skip if already registered
    if (content.includes(info.componentName)) continue;

    changed = true;

    // Add import
    const importLine = `import { ${info.componentName} } from "./${rel}/${info.fileName}"`;
    // Check if we already import from this file
    const existingImportRegex = new RegExp(
      `import\\s*\\{([^}]*)\\}\\s*from\\s*["\'].\\/${rel}\\/${info.fileName}["\']`
    );
    const existingImport = content.match(existingImportRegex);
    if (existingImport) {
      // Add to existing import
      const newImports = existingImport[1].trim() + ', ' + info.componentName;
      content = content.replace(existingImportRegex, `import { ${newImports} } from "./${rel}/${info.fileName}"`);
    } else {
      // Add new import line after last import
      const lastImportIdx = content.lastIndexOf('\nimport ');
      if (lastImportIdx !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIdx + 1);
        content = content.slice(0, endOfLine) + '\n' + importLine + content.slice(endOfLine);
      } else {
        content = importLine + '\n' + content;
      }
    }

    // Add to return object
    const entry = info.registerAs === info.componentName
      ? info.componentName
      : `${info.registerAs}: ${info.componentName}`;

    const returnMatch = content.match(/return\s*\{([^}]*)\}/s);
    if (returnMatch) {
      const existing = returnMatch[1].trimEnd();
      const comma = existing.trim().endsWith(',') ? '' : ',';
      const updated = existing + comma + `\n    ${entry},\n  `;
      content = content.replace(returnMatch[0], `return {${updated}}`);
    }
  }

  if (!changed) return 'unchanged';

  await fs.writeFile(mdxPath, content, 'utf-8');
  return 'updated';
}
