/* MDX Snippet:
```tsx
// !copy
const greeting = "Hello, World!";
console.log(greeting);
```
*/

import React, { useState, useCallback } from 'react';

interface CopyButtonProps {
  code: string;
  className?: string;
}

/**
 * CopyButton component for copying code to clipboard
 */
export function CopyButton({ code, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className={`
        p-2 rounded-md transition-colors
        ${copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
        ${className}
      `}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

/**
 * Wrapper component that adds copy button to code blocks
 */
export function CopyableCode({
  children,
  code
}: {
  children: React.ReactNode;
  code: string;
}) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton code={code} />
      </div>
    </div>
  );
}
