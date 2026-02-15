import React, { useState, useCallback } from 'react';
import { ComponentPicker } from './ComponentPicker';
import { useInjection } from '../../hooks/useInjection';

type TipType = 'success' | 'error';

interface InsertionPointProps {
  lineNumber: number;
  onInsert: (lineNumber: number, text: string) => void;
  onShowTip?: (message: string, type: TipType) => void;
  onPickerOpen?: () => void;
  onPickerClose?: () => void;
}

export function InsertionPoint({
  lineNumber,
  onInsert,
  onShowTip,
  onPickerOpen,
  onPickerClose
}: InsertionPointProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { inject } = useInjection();

  const handleClick = useCallback(() => {
    setShowPicker(true);
    onPickerOpen?.();
  }, [onPickerOpen]);

  const handleClose = useCallback(() => {
    setShowPicker(false);
    onPickerClose?.();
  }, [onPickerClose]);

  const handleSelect = useCallback(
    async (snippet: string, componentName: string) => {
      setShowPicker(false);
      const result = await inject([componentName]);
      onInsert(lineNumber, snippet);

      if (onShowTip) {
        if (result.injected.length > 0) {
          onShowTip(
            `${result.injected[0]} added to components`,
            'success'
          );
        } else if (result.skipped.length > 0) {
          onShowTip(
            `${result.skipped[0]} already in components`,
            'success'
          );
        } else if (result.failed.length > 0) {
          onShowTip(`Failed to add ${result.failed[0]}`, 'error');
        }
      }
      onPickerClose?.();
    },
    [inject, lineNumber, onInsert, onShowTip, onPickerClose]
  );

  return (
    <div className="relative h-full flex items-center justify-center w-full">
      <button
        onClick={handleClick}
        className="
          w-5 h-5 rounded-md flex items-center justify-center
          bg-ch-accent/80 text-white
          hover:bg-ch-accent hover:scale-110 hover:shadow-[0_0_8px_rgba(137,180,250,0.5)]
          active:scale-95
          transition-all duration-150 ease-out
          animate-fade-in
        "
        title="Insert component"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {showPicker && (
        <ComponentPicker
          onSelect={handleSelect}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
