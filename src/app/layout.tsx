import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Nexus Quiz - The Ultimate Knowledge Arena',
    template: '%s | Nexus Quiz',
  },
  description: 'Embark on an epic journey through knowledge. Battle through quizzes, earn XP, unlock achievements, and climb the leaderboards!',
  keywords: ['quiz', 'trivia', 'gamification', 'learning', 'education', 'games', 'knowledge', 'adtech'],
  authors: [{ name: 'Nexus Quiz Team' }],
  creator: 'Nexus Quiz',
  publisher: 'Nexus Quiz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Nexus Quiz',
    title: 'Nexus Quiz - The Ultimate Knowledge Arena',
    description: 'Embark on an epic journey through knowledge. Battle through quizzes, earn XP, unlock achievements, and climb the leaderboards!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus Quiz - The Ultimate Knowledge Arena',
    description: 'The gamified quiz experience with AI-powered learning',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="cyber-bg" />
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-dark !border-neon-cyan/20',
            style: {
              background: 'rgba(10, 10, 15, 0.9)',
              color: '#fff',
              border: '1px solid rgba(0, 255, 255, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#00ff66',
                secondary: '#000',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4444',
                secondary: '#000',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
