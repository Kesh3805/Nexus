'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore, useQuizStore } from '@/lib/store';
import { Button, Card, ProgressBar } from '@/components/ui/Elements';
import { LevelUpModal, AchievementModal } from '@/components/ui/Modals';
import { cn, getRandomEncouragement, formatTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { 
  Clock, ArrowRight, CheckCircle, XCircle,
  Zap, Trophy, Flame, Star, Home
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  xpReward: number;
  questions: Question[];
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token, updateUser } = useAuthStore();
  const { 
    currentQuestionIndex, answers, timeRemaining,
    setQuiz, nextQuestion, setAnswer, startTimer, tick, reset
  } = useQuizStore();
  
  const [quiz, setQuizData] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false); // Prevent double-submit
  const [gameState, setGameState] = useState<'playing' | 'reviewing' | 'completed'>('playing');
  const [results, setResults] = useState<{
    attempt: {
      correctCount: number;
      incorrectCount: number;
      percentage: number;
      isPerfect: boolean;
    };
    answers: Array<{ questionId: string; isCorrect: boolean; correctOptions: string[] }>;
    xp: {
      base: number;
      streak: number;
      speed: number;
      perfect: number;
      total: number;
    };
    coins: number;
    leveledUp: boolean;
    newLevel: number;
    streak: number;
    streakIncremented: boolean;
    achievements: Array<{ id: string; name: string; description: string; rarity: string }>;
    user: { level: number; xp: number; totalXp: number; coins: number; gems: number };
  } | null>(null);
  const [startTime] = useState(Date.now());
  const [submitError, setSubmitError] = useState<string | null>(null); // Error state
  
  // Modal states
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<{
    name: string;
    description: string;
    icon: string;
    rarity: string;
    xpReward: number;
  } | null>(null);
  const [encouragement, setEncouragement] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setQuizData(data);
          setQuiz(data);
          startTimer(data.timeLimit);
        } else {
          router.push('/dashboard');
        }
      } catch {
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      reset();
    };
  }, [token, params.id, router, setQuiz, startTimer, reset]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quiz?.questions.length || 0) - 1;

  // Reset local states when quiz or question changes
  useEffect(() => {
    if (quiz && currentQuestion) {
      setSelectedOption(null);
      setShowResult(false);
      setIsAnswerLocked(false);
      setEncouragement('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, quiz?.id]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || !quiz) return;
    
    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, quiz, tick]);

  // Auto-submit on timer end - with proper guards
  useEffect(() => {
    if (timeRemaining === 0 && gameState === 'playing' && !showResult && !isAnswerLocked && !isSubmitting) {
      handleOptionSelect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, gameState, showResult, isAnswerLocked, isSubmitting]);

  const handleOptionSelect = useCallback((optionId: string | null) => {
    // Prevent double-submission
    if (showResult || isAnswerLocked) return;
    
    setIsAnswerLocked(true);
    setSelectedOption(optionId);
    setShowResult(true);

    // Check if correct
    const correctOption = currentQuestion?.options.find(o => o.isCorrect);
    const isCorrect = optionId === correctOption?.id;

    // Save answer
    if (currentQuestion) {
      setAnswer(currentQuestion.id, optionId ? [optionId] : []);
    }

    // Show encouragement
    if (isCorrect) {
      setEncouragement(getRandomEncouragement('correct'));
    } else {
      setEncouragement(getRandomEncouragement('incorrect'));
    }

    // NO auto-advance - user controls the flow with Next button
  }, [showResult, isAnswerLocked, currentQuestion, setAnswer]);

  const handleSubmitQuiz = async () => {
    if (isSubmitting || !quiz) return;
    setIsSubmitting(true);
    setGameState('completed');
    setSubmitError(null);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          timeSpent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show specific error message from API
        const errorMsg = data.error || 'Failed to submit quiz';
        throw new Error(errorMsg);
      }
      setResults(data);

      // Update user state
      if (data.user) {
        updateUser(data.user);
      }

      // Celebrate perfect score
      if (data.attempt.isPerfect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Show level up modal
      if (data.leveledUp) {
        setTimeout(() => {
          setShowLevelUp(true);
        }, 500);
      }

      // Show achievement modal
      if (data.achievements?.length > 0) {
        setTimeout(() => {
          setUnlockedAchievement(data.achievements[0]);
          setShowAchievement(true);
        }, data.leveledUp ? 2500 : 500);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit quiz. Please try again.';
      setSubmitError(errorMsg);
      setGameState('playing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User-controlled next question
  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      nextQuestion();
      setSelectedOption(null);
      setShowResult(false);
      setIsAnswerLocked(false);
      setEncouragement('');
      setSubmitError(null);
      startTimer(quiz?.timeLimit || 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLastQuestion, nextQuestion, startTimer, quiz]);

  if (isLoading || !quiz || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Results Screen
  if (gameState === 'completed' && results) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10" />
            
            <div className="relative z-10 text-center">
              {/* Score Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative inline-block mb-6"
              >
                <div 
                  className={cn(
                    'w-32 h-32 rounded-full flex flex-col items-center justify-center',
                    'bg-gradient-to-br',
                    results.attempt.isPerfect 
                      ? 'from-yellow-500 to-orange-500' 
                      : 'from-neon-cyan to-neon-purple'
                  )}
                  style={{
                    boxShadow: results.attempt.isPerfect 
                      ? '0 0 60px rgba(255, 215, 0, 0.5)' 
                      : '0 0 60px rgba(0, 255, 255, 0.3)',
                  }}
                >
                  <div className="text-3xl font-cyber font-black text-white">
                    {Math.round(results.attempt.percentage)}%
                  </div>
                  <div className="text-sm text-white/80">Score</div>
                </div>
              </motion.div>

              <h2 className="text-2xl font-cyber font-bold mb-2">
                {results.attempt.isPerfect ? '🏆 PERFECT!' : 'Quiz Complete!'}
              </h2>
              
              <p className="text-gray-400 mb-6">
                {results.attempt.correctCount} of {results.attempt.correctCount + results.attempt.incorrectCount} correct
              </p>

              {/* XP Breakdown */}
              <div className="space-y-2 mb-6 text-left">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="flex items-center gap-2 text-gray-400">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Base XP
                  </span>
                  <span className="font-mono text-yellow-400">+{results.xp.base}</span>
                </div>
                
                {results.xp.streak > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Flame className="w-4 h-4 text-orange-400" />
                      Streak Bonus
                    </span>
                    <span className="font-mono text-orange-400">+{results.xp.streak}</span>
                  </div>
                )}
                
                {results.xp.speed > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Speed Bonus
                    </span>
                    <span className="font-mono text-blue-400">+{results.xp.speed}</span>
                  </div>
                )}
                
                {results.xp.perfect > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Star className="w-4 h-4 text-purple-400" />
                      Perfect Bonus
                    </span>
                    <span className="font-mono text-purple-400">+{results.xp.perfect}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30">
                  <span className="flex items-center gap-2 font-bold">
                    <Trophy className="w-4 h-4 text-neon-cyan" />
                    Total XP
                  </span>
                  <span className="font-mono text-xl font-bold text-neon-cyan">
                    +{results.xp.total}
                  </span>
                </div>
              </div>

              {/* Streak info */}
              {results.streakIncremented && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span className="font-cyber text-orange-400">
                      {results.streak} Day Streak!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => router.push('/dashboard')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    reset();
                    router.refresh();
                  }}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Next Quiz
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <LevelUpModal 
          isOpen={showLevelUp} 
          onClose={() => setShowLevelUp(false)}
          newLevel={results.newLevel}
        />

        <AchievementModal
          isOpen={showAchievement}
          onClose={() => setShowAchievement(false)}
          achievement={unlockedAchievement}
        />
      </div>
    );
  }

  // Quiz Playing Screen
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{quiz.category.icon}</span>
            <div>
              <h1 className="font-cyber text-sm text-gray-400">{quiz.category.name}</h1>
              <p className="font-cyber text-lg">{quiz.title}</p>
            </div>
          </div>
          
          {/* Timer */}
          <motion.div
            animate={timeRemaining <= 10 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeRemaining <= 10 ? Infinity : 0 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg',
              timeRemaining <= 10 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-dark-700 text-gray-300'
            )}
          >
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </motion.div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 bg-dark-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-neon-cyan font-mono">
              +{currentQuestion.points} pts
            </span>
          </div>
          <ProgressBar 
            value={currentQuestionIndex + 1} 
            max={quiz.questions.length}
            color="cyan"
            size="sm"
          />
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question Text */}
              <h2 className="text-2xl lg:text-3xl font-cyber font-bold text-center mb-8">
                {currentQuestion.text}
              </h2>

              {/* Encouragement */}
              <AnimatePresence>
                {encouragement && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center mb-6"
                  >
                    <span className="text-2xl font-cyber">{encouragement}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === option.id;
                  const isCorrect = option.isCorrect;
                  const showCorrectness = showResult;

                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      onClick={() => !showResult && handleOptionSelect(option.id)}
                      disabled={showResult}
                      className={cn(
                        'quiz-option p-4 rounded-xl text-left transition-all duration-300',
                        'flex items-center gap-4',
                        showCorrectness && isCorrect && 'correct',
                        showCorrectness && isSelected && !isCorrect && 'incorrect',
                        !showCorrectness && isSelected && 'selected'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center font-cyber font-bold',
                        'bg-white/5 border border-white/10',
                        showCorrectness && isCorrect && 'bg-green-500/20 border-green-500 text-green-400',
                        showCorrectness && isSelected && !isCorrect && 'bg-red-500/20 border-red-500 text-red-400'
                      )}>
                        {showCorrectness ? (
                          isCorrect ? <CheckCircle className="w-5 h-5" /> : 
                          isSelected ? <XCircle className="w-5 h-5" /> :
                          String.fromCharCode(65 + index)
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="flex-1 text-lg">{option.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showResult && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
                  >
                    <p className="text-blue-300 text-sm">
                      💡 {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              {submitError && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
                  {submitError}
                </div>
              )}

              {/* Next Question Button - User Controlled */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 flex justify-center"
                  >
                    <button
                      onClick={handleNextQuestion}
                      disabled={isSubmitting}
                      className={cn(
                        'px-8 py-3 rounded-xl font-cyber font-bold text-lg',
                        'bg-gradient-to-r from-neon-cyan to-neon-purple',
                        'hover:shadow-lg hover:shadow-neon-cyan/25 transition-all',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center gap-2'
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner w-5 h-5" />
                          Submitting...
                        </>
                      ) : isLastQuestion ? (
                        <>
                          Finish Quiz
                          <Trophy className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Next Question
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
