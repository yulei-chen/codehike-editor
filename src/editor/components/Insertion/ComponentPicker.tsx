import React, { useState, useEffect, useRef, useCallback } from 'react';

import calloutSnippet from '../../snippets/callout.md?raw';
import classnameSnippet from '../../snippets/classname.md?raw';
import codeMentionsSnippet from '../../snippets/code-mentions.md?raw';
import collapseSnippet from '../../snippets/collapse.md?raw';
import copyButtonSnippet from '../../snippets/copy-button.md?raw';
import diffSnippet from '../../snippets/diff.md?raw';
import fileNameSnippet from '../../snippets/file-name.md?raw';
import focusSnippet from '../../snippets/focus.md?raw';
import foldSnippet from '../../snippets/fold.md?raw';
import footnotesSnippet from '../../snippets/footnotes.md?raw';
import languageSwitcherSnippet from '../../snippets/language-switcher.md?raw';
import lineNumbersSnippet from '../../snippets/line-numbers.md?raw';
import linkSnippet from '../../snippets/link.md?raw';
import markSnippet from '../../snippets/mark.md?raw';
import scrollycodingSnippet from '../../snippets/scrollycoding.md?raw';
import slideshowSnippet from '../../snippets/slideshow.md?raw';
import spotlightSnippet from '../../snippets/spotlight.md?raw';
import tabsSnippet from '../../snippets/tabs.md?raw';
import tokenTransitionsSnippet from '../../snippets/token-transitions.md?raw';
import tooltipSnippet from '../../snippets/tooltip.md?raw';
import transpileSnippet from '../../snippets/transpile.md?raw';
import typescriptSnippet from '../../snippets/typescript.md?raw';
import wordWrapSnippet from '../../snippets/word-wrap.md?raw';

interface ComponentPickerProps {
  onSelect: (snippet: string, componentName: string) => void;
  onClose: () => void;
}

interface Template {
  name: string;
  displayName: string;
  category: 'code' | 'layout';
  snippet: string;
}

interface DependencyInfo {
  label: string;
  command: string;
}

// Templates that require external dependencies to be installed
const TEMPLATE_DEPENDENCIES: Record<string, DependencyInfo[]> = {
  collapse: [
    { label: 'shadcn/ui Collapsible', command: 'npx shadcn@latest add collapsible' },
  ],
  tooltip: [
    { label: 'shadcn/ui Tooltip', command: 'npx shadcn@latest add tooltip' },
  ],
};

const CODE_TEMPLATES: Template[] = [
  { name: 'callout', displayName: 'Callout', category: 'code', snippet: calloutSnippet },
  { name: 'classname', displayName: 'ClassName', category: 'code', snippet: classnameSnippet },
  { name: 'code-mentions', displayName: 'Code Mentions', category: 'code', snippet: codeMentionsSnippet },
  { name: 'collapse', displayName: 'Collapse', category: 'code', snippet: collapseSnippet },
  { name: 'copy-button', displayName: 'Copy Button', category: 'code', snippet: copyButtonSnippet },
  { name: 'diff', displayName: 'Diff', category: 'code', snippet: diffSnippet },
  { name: 'file-name', displayName: 'File Name', category: 'code', snippet: fileNameSnippet },
  { name: 'focus', displayName: 'Focus', category: 'code', snippet: focusSnippet },
  { name: 'fold', displayName: 'Fold', category: 'code', snippet: foldSnippet },
  { name: 'footnotes', displayName: 'Footnotes', category: 'code', snippet: footnotesSnippet },
  { name: 'language-switcher', displayName: 'Language Switcher', category: 'code', snippet: languageSwitcherSnippet },
  { name: 'line-numbers', displayName: 'Line Numbers', category: 'code', snippet: lineNumbersSnippet },
  { name: 'link', displayName: 'Link', category: 'code', snippet: linkSnippet },
  { name: 'mark', displayName: 'Mark', category: 'code', snippet: markSnippet },
  { name: 'tabs', displayName: 'Tabs', category: 'code', snippet: tabsSnippet },
  { name: 'token-transitions', displayName: 'Token Transitions', category: 'code', snippet: tokenTransitionsSnippet },
  { name: 'tooltip', displayName: 'Tooltip', category: 'code', snippet: tooltipSnippet },
  { name: 'transpile', displayName: 'Transpile', category: 'code', snippet: transpileSnippet },
  { name: 'typescript', displayName: 'TypeScript', category: 'code', snippet: typescriptSnippet },
  { name: 'word-wrap', displayName: 'Word Wrap', category: 'code', snippet: wordWrapSnippet },
];

const LAYOUT_TEMPLATES: Template[] = [
  { name: 'scrollycoding', displayName: 'Scrollycoding', category: 'layout', snippet: scrollycodingSnippet },
  { name: 'slideshow', displayName: 'Slideshow', category: 'layout', snippet: slideshowSnippet },
  { name: 'spotlight', displayName: 'Spotlight', category: 'layout', snippet: spotlightSnippet },
];

const ALL_TEMPLATES = [...CODE_TEMPLATES, ...LAYOUT_TEMPLATES];

export function ComponentPicker({ onSelect, onClose }: ComponentPickerProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'layouts'>('code');
  const [depModal, setDepModal] = useState<{
    template: Template;
    deps: DependencyInfo[];
  } | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter templates based on search and active tab
  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    const matchesSearch = t.displayName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTab =
      activeTab === 'code' ? t.category === 'code' : t.category === 'layout';
    return matchesSearch && matchesTab;
  });

  const handleTemplateClick = useCallback((template: Template) => {
    const deps = TEMPLATE_DEPENDENCIES[template.name];
    if (deps && deps.length > 0) {
      setDepModal({ template, deps });
    } else {
      onSelect(template.snippet, template.name);
    }
  }, [onSelect]);

  const handleDepContinue = useCallback(() => {
    if (depModal) {
      onSelect(depModal.template.snippet, depModal.template.name);
      setDepModal(null);
    }
  }, [depModal, onSelect]);

  const handleCopyCommand = useCallback((command: string, idx: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (depModal) {
          setDepModal(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, depModal]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (depModal) {
          setDepModal(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, depModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div
        ref={modalRef}
        className="bg-ch-surface border border-ch-border rounded-lg shadow-2xl w-[600px] max-h-[80vh] flex flex-col"
      >
        {depModal ? (
          /* Dependency install modal */
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Install Dependencies</h2>
              <button
                onClick={() => setDepModal(null)}
                className="text-ch-text-muted hover:text-ch-text p-1"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-ch-text-muted">
              <span className="text-ch-text font-medium">{depModal.template.displayName}</span> requires
              the following {depModal.deps.length === 1 ? 'dependency' : 'dependencies'}.
              Run {depModal.deps.length === 1 ? 'this command' : 'these commands'} in your project terminal:
            </p>

            <div className="flex flex-col gap-2">
              {depModal.deps.map((dep, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <span className="text-xs text-ch-text-muted">{dep.label}</span>
                  <div className="flex items-center gap-2 bg-ch-bg border border-ch-border rounded-md px-3 py-2">
                    <code className="flex-1 text-sm font-mono text-ch-accent select-all">
                      {dep.command}
                    </code>
                    <button
                      onClick={() => handleCopyCommand(dep.command, idx)}
                      className="flex-shrink-0 p-1 rounded hover:bg-ch-border transition-colors text-ch-text-muted hover:text-ch-text"
                      title="Copy command"
                    >
                      {copiedIdx === idx ? (
                        <svg className="w-4 h-4 text-ch-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDepContinue}
                className="flex-1 px-4 py-2 bg-ch-accent text-ch-bg rounded-md font-medium text-sm hover:brightness-110 transition"
              >
                Continue with injection
              </button>
              <button
                onClick={() => setDepModal(null)}
                className="px-4 py-2 border border-ch-border rounded-md text-sm text-ch-text-muted hover:text-ch-text hover:border-ch-text-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Template picker */
          <>
            {/* Header */}
            <div className="p-4 border-b border-ch-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Insert Component</h2>
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

              {/* Search */}
              <input
                type="text"
                placeholder="Search components..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-ch-bg border border-ch-border rounded-md text-ch-text placeholder:text-ch-text-muted focus:outline-none focus:border-ch-accent"
                autoFocus
              />

              {/* Tabs */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'bg-ch-accent text-ch-bg'
                      : 'text-ch-text-muted hover:text-ch-text hover:bg-ch-bg'
                  }`}
                >
                  Code ({CODE_TEMPLATES.length})
                </button>
                <button
                  onClick={() => setActiveTab('layouts')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'layouts'
                      ? 'bg-ch-accent text-ch-bg'
                      : 'text-ch-text-muted hover:text-ch-text hover:bg-ch-bg'
                  }`}
                >
                  Layouts ({LAYOUT_TEMPLATES.length})
                </button>
              </div>
            </div>

            {/* Component grid */}
            <div className="flex-1 overflow-auto p-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center text-ch-text-muted py-8">
                  No components found
                </div>
              ) : (
                <div className="component-grid">
                  {filteredTemplates.map((template) => {
                    const hasDeps = !!TEMPLATE_DEPENDENCIES[template.name];
                    return (
                      <button
                        key={template.name}
                        onClick={() => handleTemplateClick(template)}
                        className="p-3 bg-ch-bg border border-ch-border rounded-lg hover:border-ch-accent hover:bg-ch-accent/10 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <ComponentIcon category={template.category} />
                          <span className="text-sm font-medium group-hover:text-ch-accent">
                            {template.displayName}
                          </span>
                          {hasDeps && (
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-ch-warning/15 text-ch-warning font-medium">
                              deps
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ComponentIcon({ category }: { category: 'code' | 'layout' }) {
  if (category === 'layout') {
    return (
      <svg
        className="w-4 h-4 text-ch-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4 text-ch-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  );
}
