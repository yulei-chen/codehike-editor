import { describe, it, expect } from 'vitest';
import { detectComponents, componentToFileName, fileNameToComponent } from './component-detector.js';

describe('detectComponents', () => {
  it('detects JSX tags like <Focus>, <Mark />, <Collapse>', () => {
    const content = `
# My MDX

<Focus>some content</Focus>
<Mark />
<Collapse>more</Collapse>
`;
    const result = detectComponents(content);
    expect(result).toEqual(['Collapse', 'Focus', 'Mark']);
  });

  it('detects imports from codehike', () => {
    const content = `import { Focus, Mark } from "codehike/code"`;
    const result = detectComponents(content);
    expect(result).toEqual(['Focus', 'Mark']);
  });

  it('handles aliased imports (Focus as MyFocus)', () => {
    const content = `import { Focus as MyFocus } from "codehike/code"`;
    const result = detectComponents(content);
    expect(result).toEqual(['Focus']);
  });

  it('ignores non-Code Hike components', () => {
    const content = `<MyCustomComponent />\n<Button />`;
    const result = detectComponents(content);
    expect(result).toEqual([]);
  });

  it('returns sorted, deduplicated results', () => {
    const content = `
<Mark />
<Focus />
<Mark />
import { Focus } from "codehike/code"
`;
    const result = detectComponents(content);
    expect(result).toEqual(['Focus', 'Mark']);
  });
});

describe('componentToFileName', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(componentToFileName('CopyButton')).toBe('copy-button');
    expect(componentToFileName('Focus')).toBe('focus');
    expect(componentToFileName('CodeWithTabs')).toBe('code-with-tabs');
    expect(componentToFileName('LineNumbers')).toBe('line-numbers');
  });
});

describe('fileNameToComponent', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(fileNameToComponent('copy-button')).toBe('CopyButton');
    expect(fileNameToComponent('focus')).toBe('Focus');
    expect(fileNameToComponent('code-with-tabs')).toBe('CodeWithTabs');
    expect(fileNameToComponent('line-numbers')).toBe('LineNumbers');
  });
});
