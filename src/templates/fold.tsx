/* MDX Snippet:
```tsx
// !fold[1:3]
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

function Component() {
  return <div>Hello</div>
}
```
*/

import React, { useState } from 'react';

interface FoldProps {
  children: React.ReactNode;
  defaultFolded?: boolean;
  lineCount?: number;
}

/**
 * Fold component for collapsible code sections (similar to IDE folding)
 */
export function Fold({
  children,
  defaultFolded = true,
  lineCount = 0
}: FoldProps) {
  const [folded, setFolded] = useState(defaultFolded);

  return (
    <div className="relative">
      <button
        onClick={() => setFolded(!folded)}
        className="absolute -left-6 top-0 w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-300"
      >
        <svg
          className={`w-3 h-3 transition-transform ${folded ? '' : 'rotate-90'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {folded ? (
        <span
          onClick={() => setFolded(false)}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 rounded text-slate-400 text-xs cursor-pointer hover:bg-slate-700"
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          {lineCount > 0 && <span>{lineCount} lines</span>}
        </span>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * Handler for fold annotations in code blocks
 * Usage: // !fold[startLine:endLine]
 */
export function handleFoldAnnotation(
  annotation: { fromLineNumber: number; toLineNumber: number },
  children: React.ReactNode
) {
  const lineCount = annotation.toLineNumber - annotation.fromLineNumber + 1;
  return <Fold lineCount={lineCount}>{children}</Fold>;
}
