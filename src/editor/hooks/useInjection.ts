import { useState, useCallback } from 'react';

interface InjectionResult {
  injected: string[];
  skipped: string[];
  failed: string[];
}

interface UseInjectionReturn {
  inject: (components: string[]) => Promise<InjectionResult>;
  loading: boolean;
  error: string | null;
}

export function useInjection(): UseInjectionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inject = useCallback(
    async (components: string[]): Promise<InjectionResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/inject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ components })
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return { injected: [], skipped: [], failed: components };
        }

        return {
          injected: data.injected || [],
          skipped: data.skipped || [],
          failed: data.failed || []
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Injection failed';
        setError(message);
        return { injected: [], skipped: [], failed: components };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    inject,
    loading,
    error
  };
}

/**
 * Detect components used in MDX content
 */
export async function detectComponentsInContent(
  content: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/detect-components', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    const data = await response.json();
    return data.components || [];
  } catch {
    return [];
  }
}
