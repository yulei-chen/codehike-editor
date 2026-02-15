import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import { Preview } from './Preview';

interface SplitViewProps {
  content: string;
  onChange: (content: string) => void;
  filePath: string;
}

export function SplitView({ content, onChange, filePath }: SplitViewProps) {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      // Clamp between 20% and 80%
      setSplitPosition(Math.min(80, Math.max(20, percentage)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="h-full flex relative">
      {/* Editor pane */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${splitPosition}%` }}
      >
        <div className="h-full flex flex-col">
          <div className="h-10 bg-ch-surface border-b border-ch-border flex items-center px-4">
            <span className="text-sm text-ch-text-muted">Editor</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <MarkdownEditor content={content} onChange={onChange} />
          </div>
        </div>
      </div>

      {/* Resizer */}
      <div
        className={`
          w-1 bg-ch-border hover:bg-ch-accent cursor-col-resize flex-shrink-0
          transition-colors duration-150
          ${isDragging ? 'bg-ch-accent' : ''}
        `}
        onMouseDown={handleMouseDown}
      />

      {/* Preview pane */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <div className="h-full flex flex-col">
          <div className="h-10 bg-ch-surface border-b border-ch-border flex items-center px-4">
            <span className="text-sm text-ch-text-muted">Preview</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <Preview content={content} filePath={filePath} />
          </div>
        </div>
      </div>
    </div>
  );
}
