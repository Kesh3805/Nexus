'use client';

import { motion } from 'framer-motion';
import { Flame, Zap, Target, TrendingUp, Clock, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

// Streak flame animation component
export const StreakFlame = ({ streak, size = 'md' }: { streak: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-lg' },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { container: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-4xl' },
  };

  const s = sizes[size];
  const isOnFire = streak >= 7;
  const isLegend = streak >= 30;

  return (
    <motion.div
      animate={isOnFire ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      className={`relative ${s.container} flex items-center justify-center`}
    >
      {/* Glow effect */}
      {isOnFire && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={`absolute inset-0 rounded-full ${
            isLegend ? 'bg-purple-500/30' : 'bg-orange-500/30'
          } blur-xl`}
        />
      )}

      {/* Flame particles */}
      {isOnFire && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${
                isLegend ? 'bg-purple-400' : 'bg-orange-400'
              }`}
              animate={{
                y: [0, -30, -50],
                x: [(i - 2) * 5, (i - 2) * 8, (i - 2) * 3],
                opacity: [1, 0.5, 0],
                scale: [1, 0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              style={{ bottom: '30%' }}
            />
          ))}
        </>
      )}

      {/* Main icon */}
      <motion.div
        animate={isOnFire ? { rotate: [-5, 5, -5] } : {}}
        transition={{ duration: 0.3, repeat: Infinity }}
        className="relative z-10"
      >
        <Flame
          className={`${s.icon} ${
            isLegend ? 'text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]' :
            isOnFire ? 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]' :
            streak > 0 ? 'text-orange-500' : 'text-gray-500'
          }`}
        />
      </motion.div>

      {/* Streak number */}
      <div className={`absolute -bottom-1 -right-1 ${s.text} font-black ${
        isLegend ? 'text-purple-400' : isOnFire ? 'text-orange-400' : 'text-gray-400'
      }`}>
        {streak}
      </div>
    </motion.div>
  );
};

// XP Progress bar with level
export const XPProgressBar = ({
  currentXP,
  requiredXP,
  level,
  animate = true,
}: {
  currentXP: number;
  requiredXP: number;
  level: number;
  animate?: boolean;
}) => {
  const progress = (currentXP / requiredXP) * 100;

  return (
    <div className="relative">
      {/* Level badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={animate ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/30"
          >
            {level}
          </motion.div>
          <div>
            <div className="text-sm text-gray-400">Level</div>
            <div className="text-white font-bold">{level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">XP to Next Level</div>
          <div className="text-cyan-400 font-bold">{requiredXP - currentXP} XP</div>
        </div>
      </div>

      {/* Progress bar container */}
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
        />

        {/* Glow */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-50"
        />
      </div>

      {/* XP text */}
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-gray-500">{currentXP.toLocaleString()} XP</span>
        <span className="text-gray-500">{requiredXP.toLocaleString()} XP</span>
      </div>
    </div>
  );
};

// Quick stats widget
export const QuickStats = ({
  stats,
}: {
  stats: {
    quizzesCompleted: number;
    correctAnswers: number;
    totalAnswers: number;
    averageScore: number;
    bestStreak: number;
    totalXP: number;
  };
}) => {
  const statItems = [
    { icon: Target, label: 'Quizzes', value: stats.quizzesCompleted, color: 'text-cyan-400' },
    { icon: Zap, label: 'Total XP', value: stats.totalXP, color: 'text-yellow-400' },
    { icon: TrendingUp, label: 'Avg Score', value: `${stats.averageScore}%`, color: 'text-green-400' },
    { icon: Flame, label: 'Best Streak', value: stats.bestStreak, color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
        >
          <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
          <div className="text-2xl font-bold text-white">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Daily goal progress
export const DailyGoalWidget = ({
  currentXP,
  goalXP,
  quizzesCompleted,
  goalQuizzes,
}: {
  currentXP: number;
  goalXP: number;
  quizzesCompleted: number;
  goalQuizzes: number;
}) => {
  const xpProgress = Math.min((currentXP / goalXP) * 100, 100);
  const quizProgress = Math.min((quizzesCompleted / goalQuizzes) * 100, 100);
  const isComplete = currentXP >= goalXP && quizzesCompleted >= goalQuizzes;

  return (
    <div className={`rounded-2xl p-6 border ${
      isComplete 
        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50' 
        : 'bg-gray-800/50 border-gray-700/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Daily Goals
        </h3>
        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"
          >
            <Trophy className="w-3 h-3" />
            Complete!
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {/* XP Goal */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Earn {goalXP} XP</span>
            <span className={currentXP >= goalXP ? 'text-green-400' : 'text-gray-400'}>
              {currentXP}/{goalXP}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${
                currentXP >= goalXP
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Quiz Goal */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Complete {goalQuizzes} quizzes</span>
            <span className={quizzesCompleted >= goalQuizzes ? 'text-green-400' : 'text-gray-400'}>
              {quizzesCompleted}/{goalQuizzes}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${quizProgress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${
                quizzesCompleted >= goalQuizzes
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Reward preview */}
      {!isComplete && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="text-sm text-gray-400 mb-2">Complete for:</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">+100 XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">+10 Gems</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Countdown timer widget
export const CountdownWidget = ({
  title,
  targetTime,
  icon: Icon = Clock,
}: {
  title: string;
  targetTime: Date;
  icon?: React.ElementType;
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      const diff = targetTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-cyan-400" />
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <TimeUnit value={timeLeft.hours} label="hrs" />
        <span className="text-2xl text-gray-500">:</span>
        <TimeUnit value={timeLeft.minutes} label="min" />
        <span className="text-2xl text-gray-500">:</span>
        <TimeUnit value={timeLeft.seconds} label="sec" />
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <motion.div
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-2xl font-bold text-white bg-gray-700/50 rounded-lg px-3 py-1 min-w-[50px]"
    >
      {String(value).padStart(2, '0')}
    </motion.div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </div>
);

export default StreakFlame;
