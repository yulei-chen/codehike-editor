/* MDX Snippet:
```tsx
function example() {
  // !footnote[/useState/] React hook for state
  const [count, setCount] = useState(0);
  return count;
}
```
*/

import React, { useState } from 'react';

interface FootnoteProps {
  children: React.ReactNode;
  note: string;
  id: string;
}

/**
 * Footnote component for inline code annotations
 */
export function Footnote({ children, note, id }: FootnoteProps) {
  const [showNote, setShowNote] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShowNote(true)}
        onMouseLeave={() => setShowNote(false)}
        className="border-b border-dashed border-yellow-400 cursor-help"
      >
        {children}
        <sup className="text-yellow-400 text-xs ml-0.5">{id}</sup>
      </span>

      {showNote && (
        <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-slate-700 rounded text-sm text-slate-200 whitespace-nowrap z-10 shadow-lg">
          <sup className="text-yellow-400 mr-1">{id}</sup>
          {note}
        </span>
      )}
    </span>
  );
}

/**
 * FootnoteList component for displaying all footnotes at the end
 */
export function FootnoteList({
  footnotes
}: {
  footnotes: Array<{ id: string; note: string }>;
}) {
  if (footnotes.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <h4 className="text-sm font-medium text-slate-400 mb-2">Notes</h4>
      <ul className="space-y-1">
        {footnotes.map(({ id, note }) => (
          <li key={id} className="text-sm text-slate-300">
            <sup className="text-yellow-400 mr-1">{id}</sup>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Handler for footnote annotations in code blocks
 * Usage: // !footnote[/pattern/] note text
 */
export function handleFootnoteAnnotation(
  annotation: { query: string; data: string },
  children: React.ReactNode,
  index: number
) {
  return (
    <Footnote note={annotation.data} id={String(index + 1)}>
      {children}
    </Footnote>
  );
}
