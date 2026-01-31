'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { Button, Card, ProgressBar, Badge, Avatar } from '@/components/ui/Elements';
import { getAvatarUrl, getXpForLevel, cn, difficultyColors } from '@/lib/utils';
import { 
  Flame, Zap, Trophy, Target, ChevronRight, Lock, 
  Sparkles, Star, Clock, Play, Crown, Rocket, Gift
} from 'lucide-react';
import {
  SpotlightCard,
  TiltCard,
  AnimatedBorder,
  AnimatedGradientText,
  NumberTicker,
  ParticleField,
  GlowingOrb,
  ShimmerButton,
} from '@/components/ui/MagicUI';
import {
  StreakFlame,
  QuickStats,
  XPProgressBar,
  DailyGoalWidget,
  CountdownWidget,
} from '@/components/ui/Widgets';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isLocked: boolean;
  unlockLevel: number;
  _count: { quizzes: number };
}

// Skeleton loader for categories
function CategorySkeleton() {
  return (
    <div className="glass-dark rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-xl" />
        <div className="flex-1">
          <div className="h-5 bg-gray-700 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-48" />
        </div>
      </div>
      <div className="h-8 bg-gray-700 rounded w-24 mt-4" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const sidebarMargin = useSidebarMargin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // AuthProvider handles auth, just fetch data
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // Categories will remain empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Show skeleton while user data loads (handled by AuthProvider)
  if (!user) {
    return null;
  }

  const xpForNextLevel = getXpForLevel(user.level);
  const xpProgress = (user.xp / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <GlowingOrb size={500} color="#00f5ff" className="-top-40 -right-40 opacity-30" />
        <GlowingOrb size={400} color="#a855f7" className="-bottom-40 -left-40 opacity-30" />
        <ParticleField particleCount={20} />
      </div>

      <Sidebar />
      <NotificationToast />
      
      <main className={`min-h-screen relative z-10 transition-all duration-300 ${sidebarMargin}`}>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-black mb-2">
              Welcome back, <AnimatedGradientText>{user.displayName || user.username}</AnimatedGradientText>!
            </h1>
            <p className="text-gray-400">Ready to conquer some knowledge?</p>
          </motion.div>

          {/* Stats Cards - Enhanced */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Flame,
                label: 'Day Streak',
                value: user.streak,
                color: 'orange',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                icon: Zap,
                label: 'Total XP',
                value: user.totalXp,
                color: 'yellow',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Trophy,
                label: 'Quizzes Done',
                value: user.totalQuizzes,
                color: 'cyan',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                icon: Target,
                label: 'Accuracy',
                value: user.totalAnswered > 0 
                  ? Math.round((user.totalCorrect / user.totalAnswered) * 100)
                  : 0,
                suffix: '%',
                color: 'green',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard className="h-full">
                  <SpotlightCard
                    className="h-full p-6 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10"
                    spotlightColor={`rgba(${stat.color === 'orange' ? '249, 115, 22' : stat.color === 'yellow' ? '234, 179, 8' : stat.color === 'cyan' ? '0, 245, 255' : '34, 197, 94'}, 0.15)`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-0.5 mb-4`}>
                      <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                      <NumberTicker value={typeof stat.value === 'number' ? stat.value : parseInt(stat.value)} />
                      {stat.suffix || ''}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </SpotlightCard>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {/* Level Progress - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <AnimatedBorder className="rounded-2xl" borderRadius="1rem">
              <div className="p-6 bg-gray-900/80 backdrop-blur-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-cyan-500/30"
                      />
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-black text-3xl shadow-lg shadow-cyan-500/25">
                        {user.level}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Level {user.level}</h3>
                      <p className="text-gray-400">
                        <span className="text-cyan-400 font-semibold">{xpForNextLevel - user.xp}</span> XP to level {user.level + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      <NumberTicker value={user.xp} />
                    </div>
                    <div className="text-sm text-gray-400">/ {xpForNextLevel.toLocaleString()} XP</div>
                  </div>
                </div>
                
                {/* XP Progress Bar */}
                <div className="relative h-4 rounded-full bg-gray-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                    style={{ backgroundSize: '200% 100%' }} 
                  />
                </div>
              </div>
            </AnimatedBorder>
          </motion.div>

          {/* Daily Goal - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <SpotlightCard
              className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl"
              spotlightColor="rgba(168, 85, 247, 0.15)"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
                  >
                    <Gift className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Daily Goal</h3>
                    <p className="text-gray-400 text-sm">Complete 3 quizzes today</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                        i <= 1 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                          : 'border-2 border-gray-600 text-gray-500'
                      )}
                    >
                      {i <= 1 ? <Star className="w-5 h-5" /> : i}
                    </motion.div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Widgets Row - Streak, Quick Stats, XP, Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <SpotlightCard className="p-6 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <StreakFlame streak={user.streak} size="md" />
                    <div>
                      <h4 className="text-lg font-bold text-white">Streak</h4>
                      <p className="text-sm text-gray-400">Keep the streak alive — every day counts!</p>
                    </div>
                  </div>
                </SpotlightCard>
              </div>

              <div className="lg:col-span-1">
                <SpotlightCard className="p-6 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10">
                  <QuickStats
                    stats={{
                      quizzesCompleted: user.totalQuizzes || 0,
                      correctAnswers: user.totalCorrect || 0,
                      totalAnswers: user.totalAnswered || 0,
                      averageScore: user.totalAnswered > 0 ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0,
                      bestStreak: user.longestStreak || user.streak || 0,
                      totalXP: user.totalXp || 0,
                    }}
                  />
                </SpotlightCard>
              </div>

              <div className="lg:col-span-1 space-y-4">
                <SpotlightCard className="p-4 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10">
                  <XPProgressBar currentXP={user.xp} requiredXP={xpForNextLevel} level={user.level} />
                </SpotlightCard>

                <SpotlightCard className="p-4 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10">
                  <CountdownWidget title="Daily Reset" targetTime={new Date(new Date().setHours(24,0,0,0))} />
                </SpotlightCard>
              </div>
            </div>
          </motion.div>

          {/* Categories - Duolingo Style Timeline Enhanced */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">Knowledge Paths</span>
            </h2>

            <div className="relative">
              {/* Animated Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 hidden lg:block overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500" />
                <motion.div
                  animate={{ y: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-x-0 h-20 bg-gradient-to-b from-white/50 via-white/20 to-transparent"
                />
              </div>

              <div className="space-y-6">
                {categories.map((category, index) => {
                  const isLocked = category.isLocked && user.level < category.unlockLevel;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="relative"
                    >
                      {/* Timeline node */}
                      <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-all',
                            isLocked 
                              ? 'bg-gray-800 text-gray-500 border border-gray-700' 
                              : ''
                          )}
                          style={{
                            background: !isLocked ? `linear-gradient(135deg, ${category.color}, ${category.color}aa)` : undefined,
                            boxShadow: !isLocked ? `0 0 30px ${category.color}50` : undefined,
                          }}
                        >
                          {isLocked ? <Lock className="w-5 h-5" /> : category.icon}
                        </motion.div>
                      </div>

                      {/* Category Card - Enhanced */}
                      <div className="lg:ml-24">
                        <Link href={isLocked ? '#' : `/category/${category.slug}`}>
                          <motion.div
                            whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
                            className={isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          >
                            <SpotlightCard
                              className={cn(
                                'p-6 rounded-2xl bg-gray-900/50 backdrop-blur-xl border transition-all duration-300',
                                isLocked 
                                  ? 'border-gray-800' 
                                  : 'border-white/10 hover:border-cyan-500/30'
                              )}
                              spotlightColor={!isLocked ? `${category.color}20` : 'transparent'}
                            >
                              {/* Gradient overlay */}
                              <div 
                                className="absolute inset-0 opacity-10 rounded-2xl"
                                style={{ background: `linear-gradient(135deg, ${category.color}, transparent)` }}
                              />
                              
                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div 
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl lg:hidden"
                                    style={{ 
                                      background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
                                      border: `1px solid ${category.color}30`,
                                    }}
                                  >
                                    {isLocked ? <Lock className="w-7 h-7 text-gray-500" /> : category.icon}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                      {category.name}
                                      {isLocked && (
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/30">
                                          Lvl {category.unlockLevel}
                                        </span>
                                      )}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Play className="w-3.5 h-3.5" />
                                        {category._count.quizzes} quizzes
                                      </span>
                                      {!isLocked && (
                                        <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                                          <Rocket className="w-3.5 h-3.5" />
                                          Ready to play
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {!isLocked && (
                                  <motion.div
                                    whileHover={{ x: 5 }}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ 
                                      background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
                                      border: `1px solid ${category.color}30`,
                                    }}
                                  >
                                    <ChevronRight className="w-5 h-5" style={{ color: category.color }} />
                                  </motion.div>
                                )}
                              </div>
                            </SpotlightCard>
                          </motion.div>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
