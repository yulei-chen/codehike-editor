import React, { useState, useEffect, useCallback } from 'react';
import { useInjection } from '../../hooks/useInjection';
import { useComponentResolver } from '../../hooks/useComponentResolver';

interface InjectionModalProps {
  components: string[];
  onClose: () => void;
  onComplete: () => void;
}

interface ComponentStatus {
  name: string;
  exists: boolean;
}

export function InjectionModal({
  components,
  onClose,
  onComplete
}: InjectionModalProps) {
  const { inject, loading: injecting, error } = useInjection();
  const { hasUserComponent, loading: checking } = useComponentResolver();
  const [componentStatuses, setComponentStatuses] = useState<ComponentStatus[]>(
    []
  );
  const [injectionResult, setInjectionResult] = useState<{
    injected: string[];
    skipped: string[];
    failed: string[];
  } | null>(null);

  // Check which components already exist
  useEffect(() => {
    if (!checking) {
      const statuses = components.map((name) => ({
        name,
        exists: hasUserComponent(name)
      }));
      setComponentStatuses(statuses);
    }
  }, [components, checking, hasUserComponent]);

  const componentsToInject = componentStatuses.filter((c) => !c.exists);
  const existingComponents = componentStatuses.filter((c) => c.exists);

  const handleConfirm = useCallback(async () => {
    const toInject = componentsToInject.map((c) => c.name);

    if (toInject.length === 0) {
      onComplete();
      return;
    }

    const result = await inject(toInject);
    setInjectionResult(result);

    // If all succeeded, close after a short delay
    if (result.failed.length === 0) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [componentsToInject, inject, onComplete]);

  const isLoading = checking || injecting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-ch-surface border border-ch-border rounded-lg shadow-2xl w-[500px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-ch-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Save & Inject Components</h2>
          <button
            onClick={onClose}
            className="text-ch-text-muted hover:text-ch-text p-1"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && !injectionResult ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="w-6 h-6 animate-spin text-ch-accent"
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
              <span className="ml-2 text-ch-text-muted">
                {checking ? 'Checking components...' : 'Injecting components...'}
              </span>
            </div>
          ) : injectionResult ? (
            <InjectionResult result={injectionResult} />
          ) : components.length === 0 ? (
            <div className="text-center py-8 text-ch-text-muted">
              No Code Hike components detected in this file.
            </div>
          ) : (
            <div className="space-y-4">
              {componentsToInject.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-ch-text-muted mb-2">
                    Components to inject:
                  </h3>
                  <ul className="space-y-1">
                    {componentsToInject.map((component) => (
                      <li
                        key={component.name}
                        className="flex items-center gap-2 text-ch-text"
                      >
                        <svg
                          className="w-4 h-4 text-ch-success"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>{component.name}</span>
                        <span className="text-xs text-ch-text-muted">
                          (will be added)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {existingComponents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-ch-text-muted mb-2">
                    Already in your project:
                  </h3>
                  <ul className="space-y-1">
                    {existingComponents.map((component) => (
                      <li
                        key={component.name}
                        className="flex items-center gap-2 text-ch-text-muted"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>{component.name}</span>
                        <span className="text-xs">(skipped)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="p-3 bg-ch-error/10 border border-ch-error/30 rounded-md text-ch-error text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!injectionResult && (
          <div className="p-4 border-t border-ch-border flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-ch-text-muted hover:text-ch-text hover:bg-ch-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || componentsToInject.length === 0}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-150
                ${
                  componentsToInject.length > 0
                    ? 'bg-ch-accent text-ch-bg hover:bg-ch-accent-hover'
                    : 'bg-ch-border text-ch-text-muted cursor-not-allowed'
                }
              `}
            >
              {componentsToInject.length > 0
                ? `Inject ${componentsToInject.length} component${componentsToInject.length > 1 ? 's' : ''}`
                : 'Nothing to inject'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InjectionResult({
  result
}: {
  result: { injected: string[]; skipped: string[]; failed: string[] };
}) {
  return (
    <div className="space-y-4">
      {result.injected.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ch-success mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Successfully injected:
          </h3>
          <ul className="space-y-1 ml-6">
            {result.injected.map((name) => (
              <li key={name} className="text-ch-text">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.skipped.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ch-text-muted mb-2">
            Skipped (already exists):
          </h3>
          <ul className="space-y-1 ml-6">
            {result.skipped.map((name) => (
              <li key={name} className="text-ch-text-muted">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.failed.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ch-error mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Failed to inject:
          </h3>
          <ul className="space-y-1 ml-6">
            {result.failed.map((name) => (
              <li key={name} className="text-ch-error">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
