'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { motion } from 'framer-motion';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/'];

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-cyan-500"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full" />
        </motion.div>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="ml-4 text-gray-400 text-lg"
      >
        Loading Nexus...
      </motion.p>
    </div>
  );
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isHydrated, setUser } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    // If no token and trying to access protected route
    if (!token && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    // If has token but no user data, verify the token
    if (token && !user && !isVerifying) {
      setIsVerifying(true);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Invalid token');
        })
        .then((data) => {
          setUser(data.user);
          setIsReady(true);
        })
        .catch(() => {
          // Token invalid, logout and redirect
          useAuthStore.getState().logout();
          if (!isPublicRoute) {
            router.replace('/login');
          } else {
            setIsReady(true);
          }
        })
        .finally(() => {
          setIsVerifying(false);
        });
      return;
    }

    // If has token and user, or is public route, we're ready
    if ((token && user) || isPublicRoute) {
      setIsReady(true);
    }
  }, [isHydrated, token, user, pathname, router, setUser, isVerifying]);

  // Show loading while hydrating or verifying
  if (!isHydrated || (!isReady && !publicRoutes.includes(pathname))) {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
