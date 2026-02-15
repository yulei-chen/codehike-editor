/* MDX Snippet:
```tsx wordWrap
// This is a very long line that will wrap automatically when it exceeds the container width, demonstrating the word wrap feature
const longString = "This is another example of a very long string that needs to wrap";
```
*/

import React from 'react';

interface WordWrapProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * WordWrap component for code blocks with word wrapping
 */
export function WordWrap({ children, enabled = true }: WordWrapProps) {
  return (
    <div
      className={`
        ${enabled ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'}
      `}
    >
      {children}
    </div>
  );
}

/**
 * CodeWithWordWrap wrapper component
 */
export function CodeWithWordWrap({
  children,
  wordWrap = false
}: {
  children: React.ReactNode;
  wordWrap?: boolean;
}) {
  return (
    <pre
      className={`
        p-4 bg-slate-900 rounded-lg font-mono text-sm
        ${wordWrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto'}
      `}
    >
      <code>{children}</code>
    </pre>
  );
}

/**
 * Pre component with optional word wrap
 */
export function Pre({
  children,
  wordWrap = false,
  className = ''
}: {
  children: React.ReactNode;
  wordWrap?: boolean;
  className?: string;
}) {
  return (
    <pre
      className={`
        ${wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'}
        ${className}
      `}
    >
      {children}
    </pre>
  );
}
