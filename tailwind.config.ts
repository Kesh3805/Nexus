import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Neon Theme
        neon: {
          pink: '#ff00ff',
          cyan: '#00ffff',
          purple: '#bf00ff',
          blue: '#0066ff',
          green: '#00ff66',
          yellow: '#ffff00',
          orange: '#ff6600',
        },
        dark: {
          950: '#0a0a0f',
          900: '#0d0d14',
          800: '#12121c',
          700: '#1a1a28',
          600: '#252535',
          500: '#2f2f42',
        },
        glow: {
          pink: 'rgba(255, 0, 255, 0.5)',
          cyan: 'rgba(0, 255, 255, 0.5)',
          purple: 'rgba(191, 0, 255, 0.5)',
        },
      },
      fontFamily: {
        cyber: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'cyber-scan': 'cyber-scan 2s linear infinite',
        'neon-flicker': 'neon-flicker 0.15s infinite alternate-reverse',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'streak-glow': 'streak-glow 1.5s ease-in-out infinite',
        'particle-float': 'particle-float 4s ease-in-out infinite',
        'hologram': 'hologram 3s ease-in-out infinite',
        'power-surge': 'power-surge 0.5s ease-out',
        'level-up': 'level-up 0.8s ease-out',
        'xp-fill': 'xp-fill 1s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 255, 0.8), 0 0 80px rgba(0, 255, 255, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'cyber-scan': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'neon-flicker': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'streak-glow': {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 10px currentColor)' },
          '50%': { filter: 'brightness(1.3) drop-shadow(0 0 20px currentColor)' },
        },
        'particle-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)', opacity: '0.5' },
        },
        'hologram': {
          '0%, 100%': { opacity: '1', transform: 'perspective(500px) rotateX(0deg)' },
          '50%': { opacity: '0.8', transform: 'perspective(500px) rotateX(2deg)' },
        },
        'power-surge': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        'level-up': {
          '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'xp-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-glow': 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
