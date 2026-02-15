import { useEffect, useRef, useCallback } from 'react';

const DEBOUNCE_MS = 1000;

export function useAutoSave(
  filePath: string | null,
  content: string,
  originalContent: string
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(originalContent);

  const save = useCallback(async () => {
    if (!filePath || content === lastSavedRef.current) {
      return;
    }

    try {
      const response = await fetch(`/api/file/${filePath}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        lastSavedRef.current = content;
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [filePath, content]);

  // Update lastSavedRef when file changes
  useEffect(() => {
    lastSavedRef.current = originalContent;
  }, [originalContent, filePath]);

  // Debounced auto-save
  useEffect(() => {
    if (!filePath || content === lastSavedRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, filePath, save]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (filePath && content !== lastSavedRef.current) {
        // Fire and forget save on unmount
        fetch(`/api/file/${filePath}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        }).catch(() => {});
      }
    };
  }, [filePath, content]);
}
