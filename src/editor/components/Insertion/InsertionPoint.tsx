import React, { useState } from 'react';
import { ComponentPicker } from './ComponentPicker';

interface InsertionPointProps {
  lineNumber: number;
  onInsert: (lineNumber: number, text: string) => void;
}

export function InsertionPoint({ lineNumber, onInsert }: InsertionPointProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (snippet: string) => {
    onInsert(lineNumber, snippet);
    setShowPicker(false);
  };

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
