import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus Quiz - The Ultimate Knowledge Arena',
  description: 'Embark on an epic journey through knowledge. Battle through quizzes, earn XP, unlock achievements, and climb the leaderboards!',
  keywords: ['quiz', 'trivia', 'gamification', 'learning', 'education', 'games'],
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
        {children}
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
