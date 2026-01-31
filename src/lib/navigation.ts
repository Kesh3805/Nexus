import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * Enhanced router with better back navigation and state preservation
 */
export function useEnhancedRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  useEffect(() => {
    // Add current path to history
    setNavigationHistory((prev) => {
      const newHistory = [...prev, pathname];
      // Keep only last 10 pages
      return newHistory.slice(-10);
    });
  }, [pathname]);

  const goBack = useCallback(() => {
    // If we have history, go back
    if (navigationHistory.length > 1) {
      router.back();
    } else {
      // Default to dashboard if no history
      router.push('/dashboard');
    }
  }, [router, navigationHistory]);

  const safePush = useCallback((href: string) => {
    try {
      router.push(href);
    } catch {
      window.location.href = href;
    }
  }, [router]);

  const safeReplace = useCallback((href: string) => {
    try {
      router.replace(href);
    } catch {
      window.location.replace(href);
    }
  }, [router]);

  return {
    ...router,
    goBack,
    safePush,
    safeReplace,
    canGoBack: navigationHistory.length > 1,
    previousPath: navigationHistory[navigationHistory.length - 2],
  };
}

/**
 * Hook to preserve scroll position across navigation
 */
export function useScrollRestoration(key: string) {
  useEffect(() => {
    const scrollPos = sessionStorage.getItem(`scroll-${key}`);
    if (scrollPos) {
      window.scrollTo(0, parseInt(scrollPos));
    }

    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [key]);
}

/**
 * Hook to prevent navigation when there are unsaved changes
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

/**
 * Hook to track page views
 */
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Analytics integration point
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', { page_path: pathname });
    }
  }, [pathname]);
}
