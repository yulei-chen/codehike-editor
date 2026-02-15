import { useState, useEffect, useCallback } from 'react';

interface UserComponent {
  name: string;
  path: string;
  isCodeHikeOverride: boolean;
}

interface UseComponentResolverReturn {
  userComponents: UserComponent[];
  loading: boolean;
  hasUserComponent: (name: string) => boolean;
  refresh: () => Promise<void>;
}

export function useComponentResolver(): UseComponentResolverReturn {
  const [userComponents, setUserComponents] = useState<UserComponent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComponents = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/components');
      const data = await response.json();

      if (data.components) {
        setUserComponents(data.components);
      }
    } catch (err) {
      console.error('Failed to load components:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const hasUserComponent = useCallback(
    (name: string): boolean => {
      const normalizedName = name.toLowerCase();
      return userComponents.some(
        (c) => c.name.toLowerCase() === normalizedName
      );
    },
    [userComponents]
  );

  return {
    userComponents,
    loading,
    hasUserComponent,
    refresh: fetchComponents
  };
}
