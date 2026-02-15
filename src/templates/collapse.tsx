/* MDX Snippet:
```tsx
// !collapse[1:3]
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

function Component() {
  return <div>Hello</div>
}
```
*/

import React, { useState } from 'react';

interface CollapseProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  title?: string;
}

/**
 * Collapse component for collapsible code sections
 * Allows hiding/showing portions of code
 */
export function Collapse({
  children,
  defaultCollapsed = true,
  title = 'Show collapsed code'
}: CollapseProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 py-1"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {title}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setCollapsed(true)}
        className="absolute -left-6 top-0 text-slate-400 hover:text-slate-200"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {children}
    </div>
  );
}

/**
 * Handler for collapse annotations in code blocks
 * Usage: // !collapse[startLine:endLine]
 */
export function handleCollapseAnnotation(
  annotation: { fromLineNumber: number; toLineNumber: number },
  children: React.ReactNode
) {
  return (
    <Collapse title={`${annotation.toLineNumber - annotation.fromLineNumber + 1} lines collapsed`}>
      {children}
    </Collapse>
  );
}
