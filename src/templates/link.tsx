/* MDX Snippet:
```tsx
// !link[/useState/] https://react.dev/reference/react/useState
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```
*/

import React from 'react';

interface LinkProps {
  children: React.ReactNode;
  href: string;
}

/**
 * Link component for clickable code tokens
 */
export function Link({ children, href }: LinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 cursor-pointer"
    >
      {children}
    </a>
  );
}

/**
 * CodeLink wrapper for linked code
 */
export function CodeLink({
  children,
  href,
  title
}: {
  children: React.ReactNode;
  href: string;
  title?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title || href}
      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
    >
      {children}
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
      </svg>
    </a>
  );
}

/**
 * Handler for link annotations in code blocks
 * Usage: // !link[/pattern/] https://example.com
 */
export function handleLinkAnnotation(
  annotation: { query: string; data: string },
  children: React.ReactNode
) {
  return <Link href={annotation.data}>{children}</Link>;
}
