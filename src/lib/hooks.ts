import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './store';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for authenticated API fetching with caching and error handling
 */
export function useAuthFetch<T = any>(url: string, options: FetchOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { logout } = useAuthStore();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache
      if (useCache) {
        const cached = cache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMounted.current) {
            setData(cached.data);
            setLoading(false);
          }
          return cached.data;
        }
      }

      // Use Zustand store token (single source of truth)
      const token = useAuthStore.getState().token;
      
      if (options.requireAuth !== false && !token) {
        router.push('/login');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token && options.requireAuth !== false) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          throw new Error('Session expired');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Cache the result
      cache.set(url, {
        data: result,
        timestamp: Date.now(),
      });

      if (isMounted.current) {
        setData(result);
        setLoading(false);
      }

      return result;
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
        setLoading(false);
      }
      throw err;
    }
  }, [url, options, router, logout]);

  useEffect(() => {
    fetchData();
  }, [url]);

  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(url);
  }, [url]);

  return { data, loading, error, refetch, clearCache };
}

/**
 * Clear all cached data
 */
export function clearAllCache() {
  cache.clear();
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook to detect if component is in viewport
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView };
}
