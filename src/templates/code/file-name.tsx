/* MDX Snippet:
```tsx title="example.tsx"
export function Example() {
  return <div>Hello</div>;
}
```
*/

import React from 'react';

interface FileNameProps {
  filename: string;
  children: React.ReactNode;
}

/**
 * FileName component for displaying code block file names
 */
export function FileName({ filename, children }: FileNameProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <FileIcon filename={filename} />
        <span className="text-sm text-slate-300 font-medium">{filename}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * File icon based on extension
 */
function FileIcon({ filename }: { filename: string }) {
  const extension = filename.split('.').pop() || '';

  const iconColors: Record<string, string> = {
    tsx: 'text-blue-400',
    ts: 'text-blue-400',
    jsx: 'text-yellow-400',
    js: 'text-yellow-400',
    css: 'text-pink-400',
    html: 'text-orange-400',
    json: 'text-green-400',
    md: 'text-slate-400',
    py: 'text-green-400',
    rb: 'text-red-400',
    go: 'text-cyan-400',
    rs: 'text-orange-400'
  };

  const color = iconColors[extension] || 'text-slate-400';

  return (
    <svg
      className={`w-4 h-4 ${color}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

/**
 * CodeBlock wrapper with optional filename
 */
export function CodeBlock({
  title,
  children
}: {
  title?: string;
  children: React.ReactNode;
}) {
  if (title) {
    return <FileName filename={title}>{children}</FileName>;
  }
  return <>{children}</>;
}
