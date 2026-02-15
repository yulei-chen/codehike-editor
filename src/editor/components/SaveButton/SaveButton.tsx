import React, { useState, useCallback } from 'react';
import { InjectionModal } from './InjectionModal';
import { detectComponentsInContent } from '../../hooks/useInjection';

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
  const [showModal, setShowModal] = useState(false);
  const [detectedComponents, setDetectedComponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (!filePath) return;

    setLoading(true);

    try {
      // First, detect components in the content
      const components = await detectComponentsInContent(content);
      setDetectedComponents(components);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to detect components:', err);
    } finally {
      setLoading(false);
    }
  }, [filePath, content]);

  const handleComplete = useCallback(() => {
    setShowModal(false);
    onSaveComplete();
  }, [onSaveComplete]);

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!filePath || loading}
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
        {loading ? (
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
            Checking...
          </span>
        ) : (
          'Save & Inject'
        )}
      </button>

      {showModal && (
        <InjectionModal
          components={detectedComponents}
          onClose={() => setShowModal(false)}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
