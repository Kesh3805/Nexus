'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { Card, Badge, Button, ProgressBar } from '@/components/ui/Elements';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, Play, Lock, Clock, Zap, Star, 
  CheckCircle, Target
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  xpReward: number;
  coinReward: number;
  order: number;
  isLocked: boolean;
  _count: { questions: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  quizzes: Quiz[];
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const sidebarMargin = useSidebarMargin();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setCategory(data);
        } else {
          router.push('/dashboard');
        }
      } catch {
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [token, params.slug, router]);

  if (isLoading || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      
      <main className={`min-h-screen transition-all duration-300 ${sidebarMargin}`}>
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ 
                  background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
                  border: `2px solid ${category.color}50`,
                  boxShadow: `0 0 30px ${category.color}20`,
                }}
              >
                {category.icon}
              </div>
              <div>
                <h1 className="text-3xl font-cyber font-bold" style={{ color: category.color }}>
                  {category.name}
                </h1>
                <p className="text-gray-400">{category.description}</p>
              </div>
            </div>

            {/* Progress */}
            <Card className="relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-5"
                style={{ background: `linear-gradient(135deg, ${category.color}, transparent)` }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Path Progress</span>
                  <span className="text-sm font-mono" style={{ color: category.color }}>
                    0/{category.quizzes.length} completed
                  </span>
                </div>
                <ProgressBar value={0} max={category.quizzes.length} color="cyan" />
              </div>
            </Card>
          </motion.div>

          {/* Quiz Timeline */}
          <div className="relative">
            {/* Vertical path line */}
            <div 
              className="absolute left-8 top-0 bottom-0 w-1 rounded-full"
              style={{ background: `linear-gradient(180deg, ${category.color}, ${category.color}20)` }}
            />

            <div className="space-y-4">
              {category.quizzes.map((quiz, index) => {
                const isCompleted = false; // Would check from user data
                const isCurrent = index === 0;
                
                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-20"
                  >
                    {/* Node */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center border-2',
                          isCompleted 
                            ? 'bg-green-500 border-green-500' 
                            : isCurrent 
                              ? 'border-neon-cyan bg-neon-cyan/20' 
                              : 'border-gray-600 bg-dark-700'
                        )}
                        style={isCurrent && !isCompleted ? {
                          boxShadow: `0 0 20px ${category.color}50`,
                          borderColor: category.color,
                        } : undefined}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : quiz.isLocked ? (
                          <Lock className="w-4 h-4 text-gray-500" />
                        ) : (
                          <span className="font-cyber text-sm">{index + 1}</span>
                        )}
                      </motion.div>
                    </div>

                    {/* Quiz Card */}
                    <Card 
                      hover={!quiz.isLocked}
                      glow={isCurrent && !quiz.isLocked}
                      className={cn(
                        'relative overflow-hidden',
                        quiz.isLocked && 'opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-cyber text-lg">{quiz.title}</h3>
                            <Badge 
                              variant={
                                quiz.difficulty === 'EASY' ? 'success' :
                                quiz.difficulty === 'MEDIUM' ? 'warning' :
                                quiz.difficulty === 'HARD' ? 'danger' : 'purple'
                              }
                              size="sm"
                            >
                              {quiz.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-3">{quiz.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {quiz._count.questions} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {quiz.timeLimit}s each
                            </span>
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Zap className="w-3 h-3" />
                              +{quiz.xpReward} XP
                            </span>
                          </div>
                        </div>

                        <Link href={`/quiz/${quiz.id}`}>
                          <Button 
                            variant={isCurrent ? 'primary' : 'secondary'}
                            disabled={quiz.isLocked}
                            className="ml-4"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {isCompleted ? 'Replay' : 'Start'}
                          </Button>
                        </Link>
                      </div>

                      {/* Rewards preview */}
                      {!quiz.isLocked && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-400">Rewards:</span>
                          </div>
                          <Badge variant="cyan" size="sm">+{quiz.xpReward} XP</Badge>
                          <Badge variant="default" size="sm">+{quiz.coinReward} Coins</Badge>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
