'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/lib/store';
import { useEffect } from 'react';
import { X, Trophy, Flame, Zap, Star } from 'lucide-react';

const icons = {
  success: Zap,
  error: X,
  achievement: Trophy,
  levelup: Star,
  streak: Flame,
};

const colors = {
  success: 'from-green-500/20 to-green-500/5 border-green-500/50',
  error: 'from-red-500/20 to-red-500/5 border-red-500/50',
  achievement: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/50',
  levelup: 'from-purple-500/20 to-purple-500/5 border-purple-500/50',
  streak: 'from-orange-500/20 to-orange-500/5 border-orange-500/50',
};

export function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = icons[notification.type];
          const color = colors[notification.type];

          return (
            <motion.div
              key={notification.id}
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.8 }}
              className={`
                relative overflow-hidden rounded-lg border p-4 pr-10
                bg-gradient-to-r ${color}
                backdrop-blur-xl min-w-[300px] max-w-[400px]
              `}
            >
              <NotificationTimer
                duration={notification.duration || 5000}
                onComplete={() => removeNotification(notification.id)}
              />
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cyber text-sm font-bold">{notification.title}</h4>
                  <p className="text-sm text-gray-300 mt-0.5">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function NotificationTimer({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: 'linear' }}
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 origin-left"
    />
  );
}
