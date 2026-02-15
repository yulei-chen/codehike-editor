import { useState, useEffect, useCallback } from 'react';

export interface FileItem {
  path: string;
  name: string;
}

interface UseFileTreeReturn {
  files: FileItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFileTree(): UseFileTreeReturn {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/files');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setFiles([]);
      } else {
        setFiles(data.files || []);
      }
    } catch (err) {
      setError('Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    loading,
    error,
    refresh: fetchFiles
  };
}
