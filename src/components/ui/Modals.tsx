'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-[calc(100%-2rem)]',
              sizes[size]
            )}
          >
            <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h2 className="font-cyber text-lg text-neon-cyan">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Level Up Modal with special effects
interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <div className="text-center">
              {/* Glow rings */}
              <div className="relative inline-block mb-8">
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-neon-cyan"
                  style={{ width: 200, height: 200, marginLeft: -100, marginTop: -100, left: '50%', top: '50%' }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="absolute inset-0 rounded-full border-4 border-neon-purple"
                  style={{ width: 200, height: 200, marginLeft: -100, marginTop: -100, left: '50%', top: '50%' }}
                />
                
                {/* Level number */}
                <motion.div
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink"
                  style={{
                    boxShadow: '0 0 60px rgba(0, 255, 255, 0.5), 0 0 120px rgba(191, 0, 255, 0.3)',
                  }}
                >
                  <span className="text-5xl font-cyber font-black text-white">{newLevel}</span>
                </motion.div>
              </div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-cyber font-bold text-neon-cyan neon-text mb-4"
              >
                LEVEL UP!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-400 text-lg"
              >
                You&apos;ve reached level {newLevel}! Keep conquering!
              </motion.p>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-cyber font-bold rounded-lg"
              >
                CONTINUE
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Achievement Unlock Modal
interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    name: string;
    description: string;
    icon: string;
    rarity: string;
    xpReward: number;
  } | null;
}

export function AchievementModal({ isOpen, onClose, achievement }: AchievementModalProps) {
  if (!achievement) return null;

  const rarityColors: Record<string, string> = {
    COMMON: 'from-gray-400 to-gray-600',
    UNCOMMON: 'from-green-400 to-green-600',
    RARE: 'from-blue-400 to-blue-600',
    EPIC: 'from-purple-400 to-purple-600',
    LEGENDARY: 'from-orange-400 to-orange-600',
    MYTHIC: 'from-pink-400 to-pink-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-2xl p-8 text-center max-w-sm border border-white/10"
            >
              {/* Achievement Icon */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.5)',
                    '0 0 60px rgba(255, 215, 0, 0.8)',
                    '0 0 20px rgba(255, 215, 0, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`
                  inline-flex items-center justify-center w-24 h-24 rounded-2xl
                  bg-gradient-to-br ${rarityColors[achievement.rarity]}
                  text-5xl mb-6
                `}
              >
                {achievement.icon}
              </motion.div>
              
              <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider mb-2">
                Achievement Unlocked!
              </h3>
              
              <h2 className="text-2xl font-cyber font-bold text-white mb-2">
                {achievement.name}
              </h2>
              
              <p className="text-gray-400 mb-4">{achievement.description}</p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full text-yellow-400">
                <span>+{achievement.xpReward} XP</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-cyber font-bold rounded-lg"
              >
                AWESOME!
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
