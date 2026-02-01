'use client';

import { motion } from 'framer-motion';
import { cn, getAvatarUrl, getXpForLevel } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Trophy, 
  Users, 
  BarChart2, 
  Award, 
  LogOut,
  Flame,
  Gem,
  Coins,
  Zap,
  Menu,
  X,
  Swords,
  ShoppingBag,
  Calendar,
  User,
  Briefcase
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Campaign Simulator', href: '/simulator', badge: 'NEW' },
  { icon: Calendar, label: 'Daily Challenge', href: '/daily-challenge', badge: '2x XP' },
  { icon: Swords, label: 'Battle Mode', href: '/battle', badge: 'LIVE' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Users, label: 'Friends', href: '/friends' },
  { icon: ShoppingBag, label: 'Shop', href: '/shop' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Award, label: 'Achievements', href: '/achievements' },
  { icon: User, label: 'Profile', href: '/profile' },
];

// Hook to get main content margin class based on sidebar state
export function useSidebarMargin() {
  const { isSidebarOpen } = useUIStore();
  return isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20';
}

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isCollapsed = !isSidebarOpen;

  if (!user) return null;

  const xpForNextLevel = getXpForLevel(user.level);
  const xpProgress = (user.xp / xpForNextLevel) * 100;

  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-neon-cyan/50 ring-offset-2 ring-offset-dark-900">
              <img
                src={getAvatarUrl(user.avatarStyle, user.avatarSeed)}
                alt={user.username}
                className="w-full h-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-xs font-bold px-1.5 py-0.5 rounded-full">
              {user.level}
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-cyber text-sm text-neon-cyan truncate">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
          )}
        </div>

        {/* XP Bar */}
        {!isCollapsed && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Level {user.level}</span>
              <span className="text-neon-cyan">{user.xp}/{xpForNextLevel} XP</span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full progress-neon rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold streak-fire">{user.streak}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{user.gems}</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">{user.coins}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative',
                    'hover:bg-white/5 hover:text-neon-cyan group',
                    isActive 
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-neon-cyan border-l-2 border-neon-cyan' 
                      : 'text-gray-400'
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive && "drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]",
                    "group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          item.badge === 'LIVE' 
                            ? "bg-green-500/20 text-green-400 animate-pulse"
                            : item.badge === '2x XP'
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-purple-500/20 text-purple-400"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all',
            'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-lg lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6 text-neon-cyan" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed left-0 top-0 bottom-0 w-64 glass-dark z-50 flex flex-col lg:hidden"
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 glass-dark flex-col z-40"
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 p-1.5 bg-dark-700 rounded-full border border-white/10 hover:border-neon-cyan/50 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Zap className="w-3 h-3 text-neon-cyan" />
        </button>
        <SidebarContent />
      </motion.aside>
    </>
  );
}
