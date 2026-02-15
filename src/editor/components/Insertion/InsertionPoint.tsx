import React, { useState, useCallback } from 'react';
import { ComponentPicker } from './ComponentPicker';
import { useInjection } from '../../hooks/useInjection';

type TipType = 'success' | 'error';

interface InsertionPointProps {
  lineNumber: number;
  onInsert: (lineNumber: number, text: string) => void;
  onShowTip?: (message: string, type: TipType) => void;
}

export function InsertionPoint({
  lineNumber,
  onInsert,
  onShowTip
}: InsertionPointProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { inject } = useInjection();

  const handleSelect = useCallback(
    async (snippet: string, componentName: string) => {
      setShowPicker(false);
      const result = await inject([componentName]);
      onInsert(lineNumber, snippet);

      if (onShowTip) {
        if (result.injected.length > 0) {
          onShowTip(
            `${result.injected[0]} added to components/annotations`,
            'success'
          );
        } else if (result.skipped.length > 0) {
          onShowTip(
            `${result.skipped[0]} already in components/annotations`,
            'success'
          );
        } else if (result.failed.length > 0) {
          onShowTip(`Failed to add ${result.failed[0]}`, 'error');
        }
      }
    },
    [inject, lineNumber, onInsert, onShowTip]
  );

  return (
    <div className="insertion-container group relative h-full min-h-6 flex items-center w-full">
      <button
        onClick={() => setShowPicker(true)}
        className="
          insertion-point pointer-events-auto
          w-6 h-6 rounded-full bg-ch-accent text-ch-bg
          flex items-center justify-center
          hover:bg-ch-accent-hover hover:scale-110
          transition-all duration-150
          shadow-lg
        "
        title="Insert component"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {showPicker && (
        <ComponentPicker
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
