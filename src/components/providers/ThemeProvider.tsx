'use client';

import { useEffect, useState } from 'react';

const THEMES = {
  cyber: {
    primary: '#00f5ff',
    secondary: '#a855f7',
    background: 'from-gray-950 via-gray-900 to-gray-950',
  },
  neon: {
    primary: '#ff00ff',
    secondary: '#00ffff',
    background: 'from-purple-950 via-pink-900 to-purple-950',
  },
  matrix: {
    primary: '#00ff00',
    secondary: '#39ff14',
    background: 'from-green-950 via-black to-green-950',
  },
  sunset: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    background: 'from-orange-950 via-red-900 to-orange-950',
  },
  ocean: {
    primary: '#4a90e2',
    secondary: '#50e3c2',
    background: 'from-blue-950 via-cyan-900 to-blue-950',
  },
  galaxy: {
    primary: '#a855f7',
    secondary: '#ec4899',
    background: 'from-purple-950 via-indigo-900 to-purple-950',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'cyber';
    const theme = THEMES[savedTheme as keyof typeof THEMES] || THEMES.cyber;
    
    // Apply CSS variables
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    
    // Listen for theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedTheme' && e.newValue) {
        const newTheme = THEMES[e.newValue as keyof typeof THEMES] || THEMES.cyber;
        document.documentElement.style.setProperty('--color-primary', newTheme.primary);
        document.documentElement.style.setProperty('--color-secondary', newTheme.secondary);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const theme = THEMES[customEvent.detail as keyof typeof THEMES] || THEMES.cyber;
      document.documentElement.style.setProperty('--color-primary', theme.primary);
      document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
