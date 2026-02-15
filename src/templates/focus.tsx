/* MDX Snippet:
```tsx
// !focus[1:3]
import React from 'react'

function Component() {
  // This line is focused
  return <div>Hello</div>
}
```
*/

import React from 'react';

interface FocusProps {
  children: React.ReactNode;
  focused?: boolean;
}

/**
 * Focus component for highlighting specific code lines
 */
export function Focus({ children, focused = true }: FocusProps) {
  if (!focused) {
    return <span className="opacity-40">{children}</span>;
  }
  return <span className="relative">{children}</span>;
}

/**
 * FocusedLine component for individual focused lines
 */
export function FocusedLine({
  children,
  focused
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  return (
    <div
      className={`
        transition-opacity duration-200
        ${focused ? 'opacity-100 bg-blue-500/10' : 'opacity-40'}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Handler for focus annotations in code blocks
 * Usage: // !focus[startLine:endLine] or // !focus
 */
export function handleFocusAnnotation(
  annotation: { fromLineNumber?: number; toLineNumber?: number },
  lineNumber: number,
  children: React.ReactNode
) {
  const { fromLineNumber, toLineNumber } = annotation;

  // If no range specified, focus this line only
  if (fromLineNumber === undefined) {
    return <FocusedLine focused={true}>{children}</FocusedLine>;
  }

  // Check if this line is within the focus range
  const focused = lineNumber >= fromLineNumber && lineNumber <= (toLineNumber ?? fromLineNumber);

  return <FocusedLine focused={focused}>{children}</FocusedLine>;
}

/**
 * CodeWithFocus wrapper that dims unfocused lines
 */
export function CodeWithFocus({
  children,
  focusedLines
}: {
  children: React.ReactNode;
  focusedLines: number[];
}) {
  return <div className="code-with-focus">{children}</div>;
}
