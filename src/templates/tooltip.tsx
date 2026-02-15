/* MDX Snippet:
```tsx
// !tooltip[/useState/] A React hook for managing component state
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return count;
}
```
*/

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Tooltip component for code token annotations
 */
export function Tooltip({
  children,
  content,
  position = 'top'
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: position === 'top' ? rect.top : rect.bottom
      });
    }
  }, [show, position]);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-blue-400 cursor-help">
        {children}
      </span>

      {show && (
        <span
          className={`
            absolute z-50 px-2 py-1 text-sm bg-slate-700 text-slate-200
            rounded shadow-lg whitespace-nowrap
            ${positionStyles[position]}
          `}
        >
          {content}
          <span
            className={`
              absolute w-2 h-2 bg-slate-700 rotate-45
              ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
              ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              ${position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' : ''}
              ${position === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2' : ''}
            `}
          />
        </span>
      )}
    </span>
  );
}

/**
 * Handler for tooltip annotations in code blocks
 * Usage: // !tooltip[/pattern/] tooltip content
 */
export function handleTooltipAnnotation(
  annotation: { query: string; data: string },
  children: React.ReactNode
) {
  return <Tooltip content={annotation.data}>{children}</Tooltip>;
}
