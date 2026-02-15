/* MDX Snippet:
```tsx showLineNumbers
function example() {
  const x = 1;
  const y = 2;
  return x + y;
}
```
*/

import React from 'react';

interface LineNumbersProps {
  children: React.ReactNode;
  startLine?: number;
  highlightLines?: number[];
}

/**
 * LineNumbers component wrapper for code blocks
 */
export function LineNumbers({
  children,
  startLine = 1,
  highlightLines = []
}: LineNumbersProps) {
  return (
    <div className="flex">
      <div className="line-numbers flex-shrink-0 pr-4 text-right select-none text-slate-500 font-mono text-sm">
        {React.Children.map(children, (_, index) => {
          const lineNum = startLine + index;
          const isHighlighted = highlightLines.includes(lineNum);

          return (
            <div
              className={`leading-6 ${isHighlighted ? 'text-blue-400' : ''}`}
            >
              {lineNum}
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-x-auto">{children}</div>
    </div>
  );
}

/**
 * Line component for individual code lines with numbers
 */
export function Line({
  children,
  lineNumber,
  highlighted = false
}: {
  children: React.ReactNode;
  lineNumber: number;
  highlighted?: boolean;
}) {
  return (
    <div className={`flex leading-6 ${highlighted ? 'bg-blue-500/10' : ''}`}>
      <span
        className={`
          w-12 flex-shrink-0 text-right pr-4 select-none font-mono text-sm
          ${highlighted ? 'text-blue-400' : 'text-slate-500'}
        `}
      >
        {lineNumber}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

/**
 * CodeWithLineNumbers component for complete code blocks
 */
export function CodeWithLineNumbers({
  code,
  startLine = 1,
  highlightLines = []
}: {
  code: string;
  startLine?: number;
  highlightLines?: number[];
}) {
  const lines = code.split('\n');

  return (
    <div className="font-mono text-sm">
      {lines.map((line, index) => {
        const lineNum = startLine + index;
        return (
          <Line
            key={index}
            lineNumber={lineNum}
            highlighted={highlightLines.includes(lineNum)}
          >
            {line || ' '}
          </Line>
        );
      })}
    </div>
  );
}
