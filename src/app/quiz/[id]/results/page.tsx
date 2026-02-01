'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Gem, Coins, Clock, CheckCircle,
  XCircle, Flame, ChevronRight, RotateCcw,
  Home, BarChart2, Crown, Sparkles
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { AnimatedBorder } from '@/components/ui/MagicUI';
import { RewardModal, AchievementUnlockModal } from '@/components/ui/Rewards';

interface QuizResult {
  quizId: string;
  quizTitle: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned?: number;
  streakBonus: number;
  perfectBonus: boolean;
  newLevel?: number;
  newAchievements: Array<{
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    gemReward?: number;
  }>;
  leaderboardPosition?: number;
  personalBest: boolean;
}

// Animated stat counter
const AnimatedStat = ({ 
  value, 
  label, 
  icon: Icon, 
  color, 
  delay = 0,
  suffix = ''
}: { 
  value: number; 
  label: string; 
  icon: React.ElementType; 
  color: string;
  delay?: number;
  suffix?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      className="text-center"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <div className="text-3xl font-black text-white">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </motion.div>
  );
};

// Circular progress ring
const ScoreRing = ({ score, size = 200 }: { score: number; size?: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 90) return { stroke: '#22c55e', text: 'text-green-400', label: 'EXCELLENT!' };
    if (score >= 70) return { stroke: '#eab308', text: 'text-yellow-400', label: 'GREAT JOB!' };
    if (score >= 50) return { stroke: '#f97316', text: 'text-orange-400', label: 'GOOD TRY!' };
    return { stroke: '#ef4444', text: 'text-red-400', label: 'KEEP PRACTICING!' };
  };

  const colors = getScoreColor();

  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${colors.stroke})` }}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className={`text-5xl font-black ${colors.text}`}
        >
          {animatedScore}%
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className={`text-sm font-bold ${colors.text} mt-1`}
        >
          {colors.label}
        </motion.div>
      </div>
    </div>
  );
};

// Question review item
const QuestionReview = ({
  number,
  question,
  userAnswer,
  correctAnswer,
  isCorrect,
  explanation,
}: {
  number: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gray-800/50 rounded-xl p-4 border ${
        isCorrect ? 'border-green-500/30' : 'border-red-500/30'
      }`}
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCorrect ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <XCircle className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-1">Question {number}</div>
          <div className="text-white font-medium">{question}</div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your answer:</span>
                <span className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {userAnswer}
                </span>
              </div>
              {!isCorrect && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Correct answer:</span>
                  <span className="text-sm font-medium text-green-400">{correctAnswer}</span>
                </div>
              )}
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Explanation</div>
                <div className="text-sm text-gray-300">{explanation}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  useSearchParams(); // Required for client-side navigation
  const [showRewards, setShowRewards] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);

  // Mock result data
  const result: QuizResult = {
    quizId: params.id,
    quizTitle: 'Science Fundamentals',
    category: 'Science',
    categoryIcon: '🔬',
    categoryColor: '#00ffff',
    difficulty: 'MEDIUM',
    score: 85,
    correctAnswers: 17,
    totalQuestions: 20,
    timeSpent: 245,
    xpEarned: 150,
    coinsEarned: 45,
    gemsEarned: 5,
    streakBonus: 25,
    perfectBonus: false,
    newAchievements: [
      {
        name: 'Quiz Master',
        description: 'Complete 50 quizzes',
        icon: '👑',
        rarity: 'epic',
        xpReward: 500,
        gemReward: 50,
      }
    ],
    leaderboardPosition: 12,
    personalBest: true,
  };

  // Mock questions for review
  const questions = [
    { number: 1, question: 'What is the chemical symbol for water?', userAnswer: 'H2O', correctAnswer: 'H2O', isCorrect: true, explanation: 'Water is composed of two hydrogen atoms and one oxygen atom.' },
    { number: 2, question: 'What planet is known as the Red Planet?', userAnswer: 'Mars', correctAnswer: 'Mars', isCorrect: true, explanation: 'Mars appears red due to iron oxide on its surface.' },
    { number: 3, question: 'What is the speed of light?', userAnswer: '150,000 km/s', correctAnswer: '300,000 km/s', isCorrect: false, explanation: 'Light travels at approximately 299,792 km/s in a vacuum.' },
  ];

  const triggerConfetti = useCallback(() => {
    if (result.score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5ff', '#ff00ff', '#facc15'],
      });
    }
  }, [result.score]);

  useEffect(() => {
    triggerConfetti();
    
    // Show rewards modal after animations
    const timer = setTimeout(() => {
      setShowRewards(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [triggerConfetti]);

  const handleCloseRewards = () => {
    setShowRewards(false);
    if (result.newAchievements.length > 0) {
      setTimeout(() => {
        setShowAchievement(true);
      }, 500);
    }
  };

  const handleCloseAchievement = () => {
    setShowAchievement(false);
    if (currentAchievement < result.newAchievements.length - 1) {
      setCurrentAchievement(prev => prev + 1);
      setTimeout(() => setShowAchievement(true), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-cyan-900/20" />
        {result.score >= 90 && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2 mb-4"
          >
            <span className="text-2xl">{result.categoryIcon}</span>
            <span className="text-gray-300">{result.quizTitle}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              result.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
              result.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {result.difficulty}
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quiz Complete!
            </span>
          </h1>

          {result.personalBest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full px-4 py-2 mt-4"
            >
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">NEW PERSONAL BEST!</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          )}
        </motion.div>

        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="flex justify-center mb-12"
        >
          <ScoreRing score={result.score} size={220} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <AnimatedStat
            value={result.correctAnswers}
            label="Correct"
            icon={CheckCircle}
            color="from-green-500 to-emerald-600"
            delay={600}
            suffix={`/${result.totalQuestions}`}
          />
          <AnimatedStat
            value={result.timeSpent}
            label="Seconds"
            icon={Clock}
            color="from-blue-500 to-cyan-600"
            delay={800}
            suffix="s"
          />
          <AnimatedStat
            value={result.xpEarned + result.streakBonus}
            label="XP Earned"
            icon={Zap}
            color="from-yellow-500 to-orange-600"
            delay={1000}
          />
          <AnimatedStat
            value={result.coinsEarned}
            label="Coins"
            icon={Coins}
            color="from-amber-500 to-yellow-600"
            delay={1200}
          />
        </motion.div>

        {/* Bonus Section */}
        {(result.streakBonus > 0 || result.perfectBonus || result.gemsEarned) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mb-12"
          >
            <AnimatedBorder className="rounded-2xl">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Bonus Rewards
                </h3>
                <div className="flex flex-wrap gap-4">
                  {result.streakBonus > 0 && (
                    <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
                      <Flame className="w-6 h-6 text-orange-400" />
                      <div>
                        <div className="text-orange-400 font-bold">+{result.streakBonus} XP</div>
                        <div className="text-xs text-gray-400">Streak Bonus</div>
                      </div>
                    </div>
                  )}
                  {result.perfectBonus && (
                    <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3">
                      <Star className="w-6 h-6 text-purple-400" />
                      <div>
                        <div className="text-purple-400 font-bold">+100 XP</div>
                        <div className="text-xs text-gray-400">Perfect Score!</div>
                      </div>
                    </div>
                  )}
                  {result.gemsEarned && result.gemsEarned > 0 && (
                    <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/30 rounded-xl px-4 py-3">
                      <Gem className="w-6 h-6 text-pink-400" />
                      <div>
                        <div className="text-pink-400 font-bold">+{result.gemsEarned}</div>
                        <div className="text-xs text-gray-400">Gems Earned</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedBorder>
          </motion.div>
        )}

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            Question Review
          </h3>
          <div className="space-y-3">
            {questions.map((q) => (
              <QuestionReview key={q.number} {...q} />
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/quiz/${params.id}`)}
            className="py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/leaderboard')}
            className="py-4 px-6 rounded-xl font-bold bg-gray-700 text-white flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard')}
            className="py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </motion.button>
        </motion.div>
      </div>

      {/* Reward Modal */}
      <RewardModal
        isOpen={showRewards}
        onClose={handleCloseRewards}
        rewards={[
          { type: 'xp', value: result.xpEarned + result.streakBonus, label: 'Experience Points' },
          { type: 'coins', value: result.coinsEarned, label: 'Coins Earned' },
          ...(result.gemsEarned ? [{ type: 'gems' as const, value: result.gemsEarned, label: 'Gems Bonus', rarity: 'rare' as const }] : []),
        ]}
        title="Rewards Earned!"
        subtitle={`You scored ${result.score}% on ${result.quizTitle}`}
      />

      {/* Achievement Modal */}
      {result.newAchievements.length > 0 && (
        <AchievementUnlockModal
          isOpen={showAchievement}
          onClose={handleCloseAchievement}
          achievement={result.newAchievements[currentAchievement]}
        />
      )}
    </div>
  );
}
