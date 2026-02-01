'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Use a simpler props type to avoid Framer Motion conflicts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  glow = false,
  className,
  children,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center font-cyber font-medium
    transition-all duration-300 rounded-lg
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-neon-cyan to-neon-purple text-black
      hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
      focus:ring-neon-cyan
    `,
    secondary: `
      bg-transparent border border-neon-cyan/50 text-neon-cyan
      hover:bg-neon-cyan/10 hover:border-neon-cyan
      hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]
      focus:ring-neon-cyan
    `,
    ghost: `
      bg-transparent text-gray-300
      hover:bg-white/5 hover:text-white
      focus:ring-white/20
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500 text-white
      hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]
      focus:ring-red-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        glow && 'btn-glow',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ className, children, hover = false, glow = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
      onClick={onClick}
      className={cn(
        'glass rounded-xl p-6 transition-all duration-300',
        hover && 'cursor-pointer',
        glow && 'hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full bg-dark-700/50 border border-white/10 rounded-lg px-4 py-3',
            'text-white placeholder-gray-500',
            'focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30',
            'transition-all duration-300',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'purple' | 'green' | 'orange' | 'rainbow';
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'cyan',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    cyan: 'from-neon-cyan to-blue-500',
    purple: 'from-neon-purple to-pink-500',
    green: 'from-neon-green to-emerald-500',
    orange: 'from-orange-500 to-yellow-500',
    rainbow: 'from-neon-cyan via-neon-purple to-neon-pink',
  };

  return (
    <div className="space-y-1">
      <div className={cn('w-full bg-dark-600 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', colors[color])}
          style={{
            boxShadow: `0 0 10px currentColor, 0 0 20px currentColor`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  glow?: boolean;
}

export function Badge({ children, variant = 'default', size = 'sm', glow = false }: BadgeProps) {
  const variants = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        glow && 'shadow-[0_0_10px_currentColor]'
      )}
    >
      {children}
    </span>
  );
}

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  level?: number;
  isOnline?: boolean;
}

export function Avatar({ src, alt, size = 'md', level, isOnline }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full overflow-hidden ring-2 ring-neon-cyan/30 ring-offset-2 ring-offset-dark-900',
          sizes[size]
        )}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
      {level !== undefined && (
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {level}
        </div>
      )}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900" />
      )}
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-neon-cyan/20 border-t-neon-cyan animate-spin',
        sizes[size]
      )}
    />
  );
}
