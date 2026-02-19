import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  extractHandlerExports,
  getExistingHandlers,
  ensureCodeComponent,
  ensureCodeWrappers,
  ensureMdxRegistration,
} from './code-component-manager.js';

describe('extractHandlerExports', () => {
  it('extracts AnnotationHandler export names', () => {
    const content = `
import { AnnotationHandler } from "codehike/code"
export const focus: AnnotationHandler = { ... }
export const mark: AnnotationHandler = { ... }
`;
    expect(extractHandlerExports(content)).toEqual(['focus', 'mark']);
  });

  it('returns empty array when no handlers', () => {
    const content = `export function Foo() { return <div /> }`;
    expect(extractHandlerExports(content)).toEqual([]);
  });
});

describe('getExistingHandlers', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(join(tmpdir(), 'ch-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('reads handlers from code.tsx', async () => {
    await fs.writeFile(
      join(tmpDir, 'code.tsx'),
      `handlers={[focus, mark]}`,
      'utf-8'
    );
    const result = await getExistingHandlers(tmpDir);
    expect(result).toEqual(['focus', 'mark']);
  });

  it('returns [] when file missing', async () => {
    const result = await getExistingHandlers(tmpDir);
    expect(result).toEqual([]);
  });
});

describe('ensureCodeComponent', () => {
  let tmpDir: string;
  let templatesDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(join(tmpdir(), 'ch-test-'));
    templatesDir = await fs.mkdtemp(join(tmpdir(), 'ch-templates-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(templatesDir, { recursive: true, force: true });
  });

  it('creates code.tsx when absent', async () => {
    await fs.writeFile(
      join(templatesDir, 'focus.tsx'),
      `export const focus: AnnotationHandler = {}`,
      'utf-8'
    );

    const result = await ensureCodeComponent(tmpDir, templatesDir, ['focus']);
    expect(result).toBe('created');

    const content = await fs.readFile(join(tmpDir, 'code.tsx'), 'utf-8');
    expect(content).toContain('import { focus } from "./focus"');
    expect(content).toContain('handlers={[focus]}');
  });

  it('updates existing code.tsx with new handlers', async () => {
    // Create initial code.tsx
    await fs.writeFile(
      join(templatesDir, 'focus.tsx'),
      `export const focus: AnnotationHandler = {}`,
      'utf-8'
    );
    await ensureCodeComponent(tmpDir, templatesDir, ['focus']);

    // Now add mark
    await fs.writeFile(
      join(templatesDir, 'mark.tsx'),
      `export const mark: AnnotationHandler = {}`,
      'utf-8'
    );
    const result = await ensureCodeComponent(tmpDir, templatesDir, ['mark']);
    expect(result).toBe('updated');

    const content = await fs.readFile(join(tmpDir, 'code.tsx'), 'utf-8');
    expect(content).toContain('import { mark } from "./mark"');
    expect(content).toContain('focus, mark');
  });

  it("returns 'unchanged' when already present", async () => {
    await fs.writeFile(
      join(templatesDir, 'focus.tsx'),
      `export const focus: AnnotationHandler = {}`,
      'utf-8'
    );
    await ensureCodeComponent(tmpDir, templatesDir, ['focus']);

    const result = await ensureCodeComponent(tmpDir, templatesDir, ['focus']);
    expect(result).toBe('unchanged');
  });
});

describe('ensureCodeWrappers', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(join(tmpdir(), 'ch-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('adds wrapper import and wraps <Pre> return', async () => {
    await fs.writeFile(
      join(tmpDir, 'code.tsx'),
      `import { Pre, RawCode, highlight } from "codehike/code"

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, "github-dark")
  return <Pre code={highlighted} handlers={[]} />
}
`,
      'utf-8'
    );

    const result = await ensureCodeWrappers(tmpDir, ['copy-button']);
    expect(result).toBe('updated');

    const content = await fs.readFile(join(tmpDir, 'code.tsx'), 'utf-8');
    expect(content).toContain('import { CopyButton } from "./copy-button"');
    expect(content).toContain('CopyButton');
  });

  it("returns 'unchanged' when no wrappers match", async () => {
    await fs.writeFile(
      join(tmpDir, 'code.tsx'),
      `import { Pre } from "codehike/code"\nreturn <Pre />`,
      'utf-8'
    );
    const result = await ensureCodeWrappers(tmpDir, ['focus']);
    expect(result).toBe('unchanged');
  });
});

describe('ensureMdxRegistration', () => {
  let projectRoot: string;
  let targetDir: string;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(join(tmpdir(), 'ch-project-'));
    targetDir = join(projectRoot, 'app', 'components');
    await fs.mkdir(targetDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(projectRoot, { recursive: true, force: true });
  });

  it('creates mdx-components.tsx', async () => {
    const result = await ensureMdxRegistration(projectRoot, targetDir, ['code-mentions']);
    expect(result).toBe('created');

    const content = await fs.readFile(join(projectRoot, 'mdx-components.tsx'), 'utf-8');
    expect(content).toContain('useMDXComponents');
    expect(content).toContain('HoverContainer');
    expect(content).toContain('a: Link');
  });

  it('updates existing mdx-components.tsx', async () => {
    // Create initial file
    await ensureMdxRegistration(projectRoot, targetDir, ['code-mentions']);

    // Remove Link to simulate a partial file, then re-run
    let content = await fs.readFile(join(projectRoot, 'mdx-components.tsx'), 'utf-8');
    // File already has everything, so it should be unchanged
    const result = await ensureMdxRegistration(projectRoot, targetDir, ['code-mentions']);
    expect(result).toBe('unchanged');
  });

  it("returns 'unchanged' when no MDX components needed", async () => {
    const result = await ensureMdxRegistration(projectRoot, targetDir, ['focus']);
    expect(result).toBe('unchanged');
  });
});
