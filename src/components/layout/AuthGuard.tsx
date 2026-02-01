'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { token, isHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for hydration
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !isHydrated) return;

    // Check for auth
    const needsAuth = requireAuth && !token;

    if (needsAuth) {
      router.push('/login');
    }
  }, [isReady, isHydrated, requireAuth, token, router]);

  // Show loading while hydrating
  if (!isReady || !isHydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-cyan-500 animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-cyan-400">
            ⚡
          </div>
        </div>
      </div>
    );
  }

  // If auth required but not present, don't render (already redirected above)
  if (requireAuth && !token) {
    return null;
  }

  return <>{children}</>;
}
