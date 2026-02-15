/**
 * Code Hike component names that we track
 */
export const CODE_HIKE_COMPONENTS = [
  'Callout',
  'ClassName',
  'CodeMentions',
  'Collapse',
  'CopyButton',
  'Diff',
  'FileName',
  'Focus',
  'Fold',
  'Footnotes',
  'LanguageSwitcher',
  'LineNumbers',
  'Link',
  'Mark',
  'Tabs',
  'TokenTransitions',
  'Tooltip',
  'Transpile',
  'TypeScript',
  'WordWrap'
] as const;

export const CODE_HIKE_LAYOUTS = [
  'Scrollycoding',
  'Slideshow',
  'Spotlight'
] as const;

export type CodeHikeComponent = (typeof CODE_HIKE_COMPONENTS)[number];
export type CodeHikeLayout = (typeof CODE_HIKE_LAYOUTS)[number];

/**
 * All Code Hike component and layout names
 */
export const ALL_CODE_HIKE_NAMES = [
  ...CODE_HIKE_COMPONENTS,
  ...CODE_HIKE_LAYOUTS
];

/**
 * Detect Code Hike components used in MDX content
 */
export function detectComponents(content: string): string[] {
  const detected = new Set<string>();

  // Match JSX-style component usage: <ComponentName or <ComponentName>
  const jsxPattern = /<([A-Z][a-zA-Z0-9]*)/g;
  let match: RegExpExecArray | null;

  while ((match = jsxPattern.exec(content)) !== null) {
    const componentName = match[1];
    if (ALL_CODE_HIKE_NAMES.includes(componentName as CodeHikeComponent | CodeHikeLayout)) {
      detected.add(componentName);
    }
  }

  // Match import statements to catch components that are imported but maybe used differently
  const importPattern = /import\s+\{([^}]+)\}\s+from\s+['"]@?codehike/g;
  while ((match = importPattern.exec(content)) !== null) {
    const imports = match[1].split(',').map((s) => s.trim());
    for (const imp of imports) {
      // Handle "Name as Alias" syntax
      const name = imp.split(/\s+as\s+/)[0].trim();
      if (ALL_CODE_HIKE_NAMES.includes(name as CodeHikeComponent | CodeHikeLayout)) {
        detected.add(name);
      }
    }
  }

  return Array.from(detected).sort();
}

/**
 * Get the file name for a component (lowercase with hyphens)
 */
export function componentToFileName(componentName: string): string {
  // Convert PascalCase to kebab-case
  return componentName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Get the component name from a file name
 */
export function fileNameToComponent(fileName: string): string {
  // Convert kebab-case to PascalCase
  return fileName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Check if a component name is a Code Hike component
 */
export function isCodeHikeComponent(name: string): boolean {
  return ALL_CODE_HIKE_NAMES.includes(name as CodeHikeComponent | CodeHikeLayout);
}

/**
 * Check if a component is a layout
 */
export function isLayout(name: string): boolean {
  return CODE_HIKE_LAYOUTS.includes(name as CodeHikeLayout);
}
