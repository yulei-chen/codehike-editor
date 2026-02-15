/* MDX Snippet:
```tsx
// !mark[/important/]
function example() {
  // This is important
  return "marked";
}
```
*/

import React from 'react';

interface MarkProps {
  children: React.ReactNode;
  color?: 'yellow' | 'green' | 'blue' | 'red' | 'purple';
}

/**
 * Mark component for highlighting code tokens
 */
export function Mark({ children, color = 'yellow' }: MarkProps) {
  const colors = {
    yellow: 'bg-yellow-500/30 text-yellow-200',
    green: 'bg-green-500/30 text-green-200',
    blue: 'bg-blue-500/30 text-blue-200',
    red: 'bg-red-500/30 text-red-200',
    purple: 'bg-purple-500/30 text-purple-200'
  };

  return (
    <span className={`rounded px-0.5 ${colors[color]}`}>{children}</span>
  );
}

/**
 * MarkedLine component for highlighting entire lines
 */
export function MarkedLine({
  children,
  color = 'yellow'
}: {
  children: React.ReactNode;
  color?: 'yellow' | 'green' | 'blue' | 'red' | 'purple';
}) {
  const bgColors = {
    yellow: 'bg-yellow-500/10 border-l-2 border-yellow-500',
    green: 'bg-green-500/10 border-l-2 border-green-500',
    blue: 'bg-blue-500/10 border-l-2 border-blue-500',
    red: 'bg-red-500/10 border-l-2 border-red-500',
    purple: 'bg-purple-500/10 border-l-2 border-purple-500'
  };

  return <div className={`${bgColors[color]} pl-2`}>{children}</div>;
}

/**
 * Handler for mark annotations in code blocks
 * Usage: // !mark[/pattern/] or // !mark[/pattern/] color
 */
export function handleMarkAnnotation(
  annotation: { query: string; data?: string },
  children: React.ReactNode
) {
  const color = (annotation.data as MarkProps['color']) || 'yellow';
  return <Mark color={color}>{children}</Mark>;
}
