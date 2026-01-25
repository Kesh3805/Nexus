'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Trophy, Clock, Star, Users, ChevronRight, Gift,
  Flame, Target, Crown, Sparkles, Timer, Award, TrendingUp,
  Swords, Shield, Heart, Gem, Coins, Lock, Play, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import {
  ParticleField, GlowingOrb, AnimatedBorder, SpotlightCard,
  ShimmerButton, NumberTicker, MeteorShower, CyberGrid
} from '@/components/ui/MagicUI';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: { name: string; icon: string; color: string };
  difficulty: string;
  questionCount: number;
  timeLimit: number;
  xpReward: number;
  coinReward: number;
  bonusGems: number;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarStyle: string;
    level: number;
  };
  score: number;
  timeSpent: number;
}

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Countdown timer component
const CountdownTimer = ({ timeRemaining }: { timeRemaining: number }) => {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(time / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <motion.div
          className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center border border-cyan-500/30"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-2xl font-bold text-cyan-400">{String(hours).padStart(2, '0')}</span>
        </motion.div>
        <span className="text-2xl text-cyan-400 animate-pulse">:</span>
        <motion.div
          className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center border border-cyan-500/30"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.33 }}
        >
          <span className="text-2xl font-bold text-cyan-400">{String(minutes).padStart(2, '0')}</span>
        </motion.div>
        <span className="text-2xl text-cyan-400 animate-pulse">:</span>
        <motion.div
          className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center border border-cyan-500/30"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.66 }}
        >
          <span className="text-2xl font-bold text-cyan-400">{String(seconds).padStart(2, '0')}</span>
        </motion.div>
      </div>
    </div>
  );
};

// Power-up card component
const PowerUpCard = ({ 
  icon: Icon, 
  name, 
  description, 
  cost, 
  currency,
  owned,
  onBuy 
}: {
  icon: any;
  name: string;
  description: string;
  cost: number;
  currency: 'gems' | 'coins';
  owned: number;
  onBuy: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className="relative bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all"
  >
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">{name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {currency === 'gems' ? (
              <Gem className="w-4 h-4 text-purple-400" />
            ) : (
              <Coins className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-sm font-medium text-white">{cost}</span>
          </div>
          {owned > 0 && (
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              Owned: {owned}
            </span>
          )}
        </div>
      </div>
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onBuy}
      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/40 transition-colors"
    >
      <span className="text-purple-400 text-lg">+</span>
    </motion.button>
  </motion.div>
);

export default function DailyChallengePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPowerUp, setSelectedPowerUp] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const res = await fetch('/api/daily-challenge');
      const data = await res.json();

      if (res.ok) {
        setChallenge(data.challenge);
        setLeaderboard(data.leaderboard);
        setHasCompleted(data.hasCompleted);
        setTodayScore(data.todayScore);
        setTimeRemaining(data.timeRemaining);
        setParticipantCount(data.participantCount);
      }
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const powerUps = [
    { icon: Zap, name: 'Double XP', description: 'Earn 2x XP from this challenge', cost: 25, currency: 'gems' as const, owned: 2 },
    { icon: Clock, name: 'Time Freeze', description: 'Pause timer for 30 seconds', cost: 15, currency: 'gems' as const, owned: 0 },
    { icon: Shield, name: 'Second Chance', description: 'Get one wrong answer forgiven', cost: 50, currency: 'coins' as const, owned: 1 },
    { icon: Target, name: 'Hint Reveal', description: 'Eliminate 2 wrong answers', cost: 30, currency: 'coins' as const, owned: 3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-cyan-900/20" />
          <CyberGrid />
          <MeteorShower />
          <FloatingParticles />
        </div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Flame className="w-10 h-10 text-orange-500" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black">
                <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  DAILY CHALLENGE
                </span>
              </h1>
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Flame className="w-10 h-10 text-orange-500" />
              </motion.div>
            </div>
            <p className="text-gray-400">Complete today's challenge for bonus rewards!</p>
            
            {/* Countdown */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Resets in</span>
              <CountdownTimer timeRemaining={timeRemaining} />
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Challenge Card */}
            <div className="lg:col-span-2 space-y-6">
              {challenge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatedBorder className="rounded-2xl">
                    <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8">
                      {/* Challenge Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center text-3xl border border-orange-500/50"
                          >
                            {challenge.category.icon}
                          </motion.div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
                            <p className="text-gray-400 mt-1">{challenge.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${challenge.category.color}20`,
                                  color: challenge.category.color 
                                }}
                              >
                                {challenge.category.name}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                challenge.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                                challenge.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {challenge.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                        {hasCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/50"
                          >
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium">Completed!</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                          <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{challenge.questionCount}</div>
                          <div className="text-xs text-gray-400">Questions</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                          <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{challenge.timeLimit}s</div>
                          <div className="text-xs text-gray-400">Per Question</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-yellow-400">2x</div>
                          <div className="text-xs text-gray-400">XP Multiplier</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                          <Users className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{participantCount}</div>
                          <div className="text-xs text-gray-400">Participants</div>
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-xl p-6 border border-purple-500/30 mb-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Gift className="w-5 h-5 text-purple-400" />
                          Challenge Rewards
                        </h3>
                        <div className="flex items-center justify-around">
                          <div className="text-center">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2"
                            >
                              <Zap className="w-6 h-6 text-yellow-400" />
                            </motion.div>
                            <div className="text-xl font-bold text-yellow-400">{challenge.xpReward}</div>
                            <div className="text-xs text-gray-400">XP</div>
                          </div>
                          <div className="text-center">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                              className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2"
                            >
                              <Coins className="w-6 h-6 text-amber-400" />
                            </motion.div>
                            <div className="text-xl font-bold text-amber-400">{challenge.coinReward}</div>
                            <div className="text-xs text-gray-400">Coins</div>
                          </div>
                          <div className="text-center">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                              className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2"
                            >
                              <Gem className="w-6 h-6 text-purple-400" />
                            </motion.div>
                            <div className="text-xl font-bold text-purple-400">{challenge.bonusGems}</div>
                            <div className="text-xs text-gray-400">Bonus Gems</div>
                          </div>
                          <div className="text-center">
                            <motion.div
                              animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                              className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-2"
                            >
                              <Trophy className="w-6 h-6 text-cyan-400" />
                            </motion.div>
                            <div className="text-xl font-bold text-cyan-400">Top 3</div>
                            <div className="text-xs text-gray-400">Special Badge</div>
                          </div>
                        </div>
                      </div>

                      {/* Start Button */}
                      {!hasCompleted ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/quiz/${challenge.id}?daily=true`)}
                          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-400 hover:via-red-400 hover:to-pink-400 transition-all flex items-center justify-center gap-3 group"
                        >
                          <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          START CHALLENGE
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </motion.button>
                      ) : (
                        <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700/50">
                          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                          <div className="text-2xl font-bold text-white mb-1">Your Score: {todayScore}%</div>
                          <p className="text-gray-400">Come back tomorrow for a new challenge!</p>
                        </div>
                      )}
                    </div>
                  </AnimatedBorder>
                </motion.div>
              )}

              {/* Power-ups Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Power-ups
                  </h3>
                  <span className="text-sm text-gray-400">Use before starting</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {powerUps.map((powerUp, index) => (
                    <PowerUpCard key={index} {...powerUp} onBuy={() => {}} />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <SpotlightCard className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Today's Champions
                </h3>

                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30' :
                          'bg-gray-800/50 border border-gray-700/50'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-gray-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {index < 3 ? <Crown className="w-4 h-4" /> : entry.rank}
                        </div>

                        {/* Avatar */}
                        <img
                          src={`https://api.dicebear.com/7.x/${entry.user.avatarStyle}/svg?seed=${entry.user.username}`}
                          alt={entry.user.username}
                          className="w-10 h-10 rounded-full bg-gray-700"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {entry.user.displayName || entry.user.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            Level {entry.user.level} • {entry.timeSpent}s
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-cyan-400">{entry.score}%</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No one has completed today's challenge yet.</p>
                    <p className="text-sm mt-1">Be the first!</p>
                  </div>
                )}
              </SpotlightCard>

              {/* Streak Bonus Card */}
              <SpotlightCard className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Daily Challenge Streak
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-black text-orange-400">
                      {user?.streak || 0}
                    </div>
                    <div className="text-sm text-gray-400">Day Streak</div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <motion.div
                        key={day}
                        animate={day <= (user?.streak || 0) % 7 || (user?.streak || 0) >= 7 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, delay: day * 0.1 }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          day <= (user?.streak || 0) % 7 || (user?.streak || 0) >= 7
                            ? 'bg-gradient-to-br from-orange-500 to-red-500'
                            : 'bg-gray-700'
                        }`}
                      >
                        {day <= (user?.streak || 0) % 7 || (user?.streak || 0) >= 7 ? (
                          <Flame className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs text-gray-400">{day}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-400">Complete 7 days for</div>
                  <div className="text-lg font-bold text-purple-400 flex items-center justify-center gap-2 mt-1">
                    <Gem className="w-5 h-5" /> 50 Bonus Gems
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
