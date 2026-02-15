/* MDX Snippet:
```tsx
function greet(name) {
-  console.log("Hello");
+  console.log("Hello, " + name);
}
```
*/

import React from 'react';

interface DiffLineProps {
  children: React.ReactNode;
  type: 'add' | 'remove' | 'neutral';
}

/**
 * DiffLine component for showing code diffs
 */
export function DiffLine({ children, type }: DiffLineProps) {
  const styles = {
    add: 'bg-green-500/20 border-l-2 border-green-500',
    remove: 'bg-red-500/20 border-l-2 border-red-500',
    neutral: ''
  };

  const prefixes = {
    add: '+',
    remove: '-',
    neutral: ' '
  };

  return (
    <div className={`${styles[type]} pl-4`}>
      <span className="text-slate-500 select-none mr-2">{prefixes[type]}</span>
      {children}
    </div>
  );
}

/**
 * Diff component wrapper for diff code blocks
 */
export function Diff({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-sm">{children}</div>;
}

/**
 * Handler for diff annotations in code blocks
 * Lines starting with + are additions, - are removals
 */
export function handleDiffAnnotation(
  line: string,
  children: React.ReactNode
): React.ReactNode {
  if (line.startsWith('+')) {
    return <DiffLine type="add">{children}</DiffLine>;
  }
  if (line.startsWith('-')) {
    return <DiffLine type="remove">{children}</DiffLine>;
  }
  return <DiffLine type="neutral">{children}</DiffLine>;
}
