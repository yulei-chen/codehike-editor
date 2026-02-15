import React, { useState, useCallback } from 'react';

interface SaveButtonProps {
  filePath: string | null;
  content: string;
  onSaveComplete: () => void;
}

export function SaveButton({
  filePath,
  content,
  onSaveComplete
}: SaveButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleClick = useCallback(async () => {
    if (!filePath) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/file/${filePath}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        onSaveComplete();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }, [filePath, content, onSaveComplete]);

  return (
    <button
      onClick={handleClick}
      disabled={!filePath || saving}
      className={`
        px-4 py-2 rounded-md font-medium text-sm
        transition-colors duration-150
        ${
          filePath
            ? 'bg-ch-accent text-ch-bg hover:bg-ch-accent-hover'
            : 'bg-ch-border text-ch-text-muted cursor-not-allowed'
        }
      `}
    >
      {saving ? (
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving...
        </span>
      ) : (
        'Save'
      )}
    </button>
  );
}
