'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Gem, Coins, Crown, Award, Flame,
  Target, TrendingUp, Sparkles, Gift, X, ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Types
interface Reward {
  type: 'xp' | 'coins' | 'gems' | 'achievement' | 'level' | 'streak';
  value: number | string;
  label: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: Reward[];
  title?: string;
  subtitle?: string;
}

// Particle burst effect
const ParticleBurst = ({ color }: { color: string }) => {
  const particles = [...Array(20)].map((_, i) => ({
    id: i,
    angle: (360 / 20) * i,
    distance: 100 + Math.random() * 50,
    size: 4 + Math.random() * 4,
    delay: Math.random() * 0.2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            opacity: 0,
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// Glowing ring animation
const GlowingRing = ({ delay = 0, color }: { delay?: number; color: string }) => (
  <motion.div
    className="absolute inset-0 rounded-full border-2"
    style={{ borderColor: color }}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{
      scale: [0.8, 1.5, 1.5],
      opacity: [0, 0.5, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Reward icon with animation
const RewardIcon = ({ reward }: { reward: Reward }) => {
  const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
    xp: { icon: Zap, color: '#facc15', bg: 'from-yellow-500/30 to-amber-500/30' },
    coins: { icon: Coins, color: '#fbbf24', bg: 'from-amber-500/30 to-orange-500/30' },
    gems: { icon: Gem, color: '#a855f7', bg: 'from-purple-500/30 to-pink-500/30' },
    achievement: { icon: Award, color: '#22d3ee', bg: 'from-cyan-500/30 to-blue-500/30' },
    level: { icon: TrendingUp, color: '#22c55e', bg: 'from-green-500/30 to-emerald-500/30' },
    streak: { icon: Flame, color: '#f97316', bg: 'from-orange-500/30 to-red-500/30' },
  };

  const config = iconMap[reward.type] || iconMap.xp;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Glow rings */}
      <GlowingRing color={config.color} delay={0} />
      <GlowingRing color={config.color} delay={0.5} />
      <GlowingRing color={config.color} delay={1} />
      
      {/* Icon container */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${config.bg} flex items-center justify-center border-2`}
        style={{ borderColor: `${config.color}50` }}
      >
        {reward.icon ? (
          <span className="text-4xl">{reward.icon}</span>
        ) : (
          <Icon className="w-12 h-12" style={{ color: config.color }} />
        )}
      </motion.div>
    </motion.div>
  );
};

// Number counter animation
const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// Single reward display
const RewardDisplay = ({ reward, index }: { reward: Reward; index: number }) => {
  const rarityColors: Record<string, { text: string; bg: string; border: string }> = {
    common: { text: 'text-gray-300', bg: 'bg-gray-500/20', border: 'border-gray-500/50' },
    rare: { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
    epic: { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
    legendary: { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' },
  };

  const colors = rarityColors[reward.rarity || 'common'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5 + index * 0.15, type: 'spring' }}
      className={`${colors.bg} ${colors.border} border rounded-xl p-4 text-center`}
    >
      <RewardIcon reward={reward} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 + index * 0.15 }}
        className="mt-4"
      >
        <div className={`text-2xl font-black ${colors.text}`}>
          {typeof reward.value === 'number' ? (
            <AnimatedNumber value={reward.value} suffix={reward.type === 'xp' ? ' XP' : ''} />
          ) : (
            reward.value
          )}
        </div>
        <div className="text-sm text-gray-400 mt-1">{reward.label}</div>
        {reward.rarity && reward.rarity !== 'common' && (
          <div className={`text-xs ${colors.text} mt-2 uppercase font-bold`}>
            {reward.rarity}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Level up display
const LevelUpDisplay = ({ level }: { level: number }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', duration: 0.8 }}
    className="text-center"
  >
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="relative inline-block"
    >
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
        <div className="text-5xl font-black text-white">{level}</div>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-10px] rounded-full border-4 border-dashed border-yellow-500/30"
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6"
    >
      <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
        LEVEL UP!
      </div>
      <div className="text-gray-400 mt-2">You've reached a new level!</div>
    </motion.div>
  </motion.div>
);

// Main Reward Modal
export const RewardModal = ({
  isOpen,
  onClose,
  rewards,
  title = 'Rewards Earned!',
  subtitle = 'Congratulations on your achievement!',
}: RewardModalProps) => {
  const [showRewards, setShowRewards] = useState(false);

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#00f5ff', '#ff00ff', '#facc15', '#22c55e'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#00f5ff', '#ff00ff', '#facc15', '#22c55e'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowRewards(false);
      const timer = setTimeout(() => {
        setShowRewards(true);
        triggerConfetti();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, triggerConfetti]);

  const hasLevelUp = rewards.some(r => r.type === 'level');
  const levelReward = rewards.find(r => r.type === 'level');
  const otherRewards = rewards.filter(r => r.type !== 'level');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateX: -30 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateX: 30 }}
            transition={{ type: 'spring', duration: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-3xl p-8 max-w-lg w-full border border-gray-700 overflow-hidden"
          >
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-cyan-500/20 via-transparent to-transparent blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-pink-500/20 via-transparent to-transparent blur-3xl" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-4"
                >
                  <div className="relative">
                    <Trophy className="w-16 h-16 text-yellow-400" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-2"
                    >
                      <Sparkles className="w-6 h-6 text-yellow-300 absolute top-0 right-0" />
                      <Sparkles className="w-4 h-4 text-cyan-300 absolute bottom-0 left-0" />
                    </motion.div>
                  </div>
                </motion.div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {title}
                </h2>
                <p className="text-gray-400 mt-2">{subtitle}</p>
              </motion.div>

              {/* Level up (if applicable) */}
              {hasLevelUp && levelReward && showRewards && (
                <div className="mb-8">
                  <LevelUpDisplay level={Number(levelReward.value)} />
                </div>
              )}

              {/* Rewards grid */}
              {showRewards && otherRewards.length > 0 && (
                <div className={`grid gap-4 ${otherRewards.length === 1 ? 'grid-cols-1' : otherRewards.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                  {otherRewards.map((reward, index) => (
                    <RewardDisplay key={index} reward={reward} index={index} />
                  ))}
                </div>
              )}

              {/* Claim button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full mt-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Claim Rewards
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Achievement unlock modal
export const AchievementUnlockModal = ({
  isOpen,
  onClose,
  achievement,
}: {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    gemReward?: number;
  };
}) => {
  const rarityConfig = {
    common: { color: 'from-gray-400 to-gray-500', glow: 'shadow-gray-500/50', text: 'text-gray-300' },
    rare: { color: 'from-blue-400 to-cyan-400', glow: 'shadow-cyan-500/50', text: 'text-cyan-400' },
    epic: { color: 'from-purple-400 to-pink-400', glow: 'shadow-purple-500/50', text: 'text-purple-400' },
    legendary: { color: 'from-yellow-400 to-orange-400', glow: 'shadow-yellow-500/50', text: 'text-yellow-400' },
  };

  const config = rarityConfig[achievement.rarity];

  useEffect(() => {
    if (isOpen && achievement.rarity === 'legendary') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f97316', '#ef4444'],
      });
    }
  }, [isOpen, achievement.rarity]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', duration: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-gray-700 overflow-hidden text-center"
          >
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${config.color} opacity-10`} />
            
            <ParticleBurst color={achievement.rarity === 'legendary' ? '#facc15' : '#00f5ff'} />

            <div className="relative z-10">
              {/* Badge */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-6"
              >
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase bg-gradient-to-r ${config.color} text-gray-900`}>
                  {achievement.rarity} Achievement
                </span>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative inline-block mb-6"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className={`absolute -inset-4 rounded-full border-2 border-dashed ${config.text} opacity-30`}
                />
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-5xl shadow-lg ${config.glow}`}>
                  {achievement.icon}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-2xl font-black ${config.text} mb-2`}
              >
                {achievement.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-400 mb-6"
              >
                {achievement.description}
              </motion.p>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-6 mb-6"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold text-yellow-400">+{achievement.xpReward} XP</span>
                </div>
                {achievement.gemReward && (
                  <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-purple-400" />
                    <span className="text-lg font-bold text-purple-400">+{achievement.gemReward}</span>
                  </div>
                )}
              </motion.div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className={`w-full py-3 rounded-xl font-bold bg-gradient-to-r ${config.color} text-gray-900`}
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// XP gain popup (floating notification)
export const XPGainPopup = ({
  amount,
  onComplete,
}: {
  amount: number;
  onComplete: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.5 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -50, opacity: 0, scale: 0.5 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl px-6 py-4 border border-yellow-500/50 flex items-center gap-3 shadow-lg shadow-yellow-500/20">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          <Zap className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <div>
          <div className="text-2xl font-black text-yellow-400">
            +{amount} XP
          </div>
          <div className="text-xs text-gray-400">Experience gained!</div>
        </div>
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ChevronUp className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RewardModal;
