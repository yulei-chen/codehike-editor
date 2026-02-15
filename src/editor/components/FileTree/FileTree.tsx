import React from 'react';

interface FileItem {
  path: string;
  name: string;
}

interface FileTreeProps {
  files: FileItem[];
  selectedFile: FileItem | null;
  onSelect: (file: FileItem) => void;
}

export function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  if (files.length === 0) {
    return (
      <div className="p-4 text-ch-text-muted text-sm">
        No MDX files found in /app directory
      </div>
    );
  }

  // Group files by directory
  const grouped = groupByDirectory(files);

  return (
    <div className="py-2">
      {Object.entries(grouped).map(([dir, dirFiles]) => (
        <div key={dir}>
          {dir !== '' && (
            <div className="px-3 py-1 text-xs text-ch-text-muted font-medium">
              {dir}
            </div>
          )}
          {dirFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => onSelect(file)}
              className={`
                file-item w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm
                ${selectedFile?.path === file.path ? 'selected bg-ch-accent/20 text-ch-accent' : 'text-ch-text hover:text-ch-accent'}
              `}
            >
              <FileIcon />
              <span className="truncate">{getFileName(file.name)}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function FileIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0 opacity-60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function groupByDirectory(files: FileItem[]): Record<string, FileItem[]> {
  const grouped: Record<string, FileItem[]> = {};

  for (const file of files) {
    const parts = file.name.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';

    if (!grouped[dir]) {
      grouped[dir] = [];
    }
    grouped[dir].push(file);
  }

  return grouped;
}

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}
