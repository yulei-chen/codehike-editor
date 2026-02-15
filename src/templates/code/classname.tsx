/* MDX Snippet:
```tsx
// !className[/important/] bg-yellow-200
function example() {
  // This is important
  return "highlighted";
}
```
*/

import React from 'react';

interface ClassNameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ClassName annotation handler for Code Hike
 * Applies custom CSS classes to matched code tokens
 */
export function ClassName({ children, className }: ClassNameProps) {
  return <span className={className}>{children}</span>;
}

/**
 * Handler for className annotations in code blocks
 * Usage: // !className[/pattern/] classNames
 */
export function handleClassNameAnnotation(
  annotation: { query: string; data: string },
  children: React.ReactNode
) {
  const className = annotation.data || 'bg-yellow-200/50';
  return <ClassName className={className}>{children}</ClassName>;
}
