import React, { useState, useCallback } from 'react';
import { FileTree } from './components/FileTree/FileTree';
import { SplitView } from './components/Editor/SplitView';
import { SaveButton } from './components/SaveButton/SaveButton';
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

  const handleSaveComplete = useCallback(() => {
    // After injection, update original content to match current
    setOriginalContent(content);
  }, [content]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-ch-surface border-b border-ch-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-ch-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 18l6-6-6-6" />
            <path d="M8 6l-6 6 6 6" />
          </svg>
          <h1 className="text-lg font-semibold">Code Hike Editor</h1>
        </div>

        <div className="flex items-center gap-3">
          {selectedFile && (
            <span className="text-sm text-ch-text-muted">
              {selectedFile.name}
            </span>
          )}
          <SaveButton
            filePath={selectedFile?.path ?? null}
            content={content}
            onSaveComplete={handleSaveComplete}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File tree sidebar */}
        <aside className="w-64 bg-ch-surface border-r border-ch-border overflow-auto">
          <div className="p-3 border-b border-ch-border">
            <h2 className="text-sm font-medium text-ch-text-muted uppercase tracking-wider">
              Files
            </h2>
          </div>
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
        </aside>

        {/* Editor area */}
        <main className="flex-1 overflow-hidden">
          {selectedFile ? (
            <SplitView
              content={content}
              onChange={handleContentChange}
              filePath={selectedFile.path}
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
    </div>
  );
}
