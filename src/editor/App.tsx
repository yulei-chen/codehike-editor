import React, { useState, useCallback } from 'react';
import { FileTree } from './components/FileTree/FileTree';
import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import { useFileTree } from './hooks/useFileTree';
import { useAutoSave } from './hooks/useAutoSave';

interface FileData {
  path: string;
  name: string;
}

export default function App() {
  const { files, loading, error, refresh } = useFileTree();
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleFileSelect = useCallback(async (file: FileData) => {
    try {
      const response = await fetch(`/api/file/${file.path}`);
      const data = await response.json();

      if (data.content !== undefined) {
        setSelectedFile(file);
        setContent(data.content);
        setOriginalContent(data.content);
      }
    } catch (err) {
      console.error('Failed to load file:', err);
    }
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Auto-save hook
  useAutoSave(selectedFile?.path ?? null, content, originalContent);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* File tree sidebar */}
      {sidebarOpen && (
        <aside className="w-64 bg-ch-surface border-r border-ch-border overflow-auto flex-shrink-0 flex flex-col">
          <div className="p-3 border-b border-ch-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-ch-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6l-6 6 6 6" />
              </svg>
              <h1 className="text-sm font-semibold">Code Hike Editor</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-ch-border transition-colors text-ch-text-muted hover:text-ch-text"
              title="Hide sidebar"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 19l-7-7 7-7" />
                <path d="M18 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-4 text-ch-text-muted text-sm">Loading...</div>
            ) : error ? (
              <div className="p-4 text-ch-error text-sm">{error}</div>
            ) : (
              <FileTree
                files={files}
                selectedFile={selectedFile}
                onSelect={handleFileSelect}
              />
            )}
          </div>
        </aside>
      )}

      {/* Editor area */}
      <main className="flex-1 overflow-hidden relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-10 p-1.5 rounded bg-ch-surface border border-ch-border hover:bg-ch-border transition-colors text-ch-text-muted hover:text-ch-text"
            title="Show sidebar"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 5l7 7-7 7" />
              <path d="M6 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {selectedFile ? (
          <MarkdownEditor
            content={content}
            onChange={handleContentChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-ch-text-muted">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Select an MDX file to start editing</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
