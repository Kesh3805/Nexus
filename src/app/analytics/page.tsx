'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { Card, ProgressBar } from '@/components/ui/Elements';
import { cn } from '@/lib/utils';
import { 
  BarChart2, TrendingUp, Target, Zap, 
  CheckCircle, Trophy, Flame
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalQuizzes: number;
    totalXp: number;
    accuracy: string;
    totalTime: number;
    perfectQuizzes: number;
    avgScore: string | number;
  };
  chartData: {
    date: string;
    xp: number;
    quizzes: number;
    accuracy: number;
  }[];
  categoryStats: {
    name: string;
    color: string;
    quizzes: number;
    correct: number;
    total: number;
  }[];
  bestCategory: { name: string; icon: string; accuracy: number } | null;
  worstCategory: { name: string; icon: string; accuracy: number } | null;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const sidebarMargin = useSidebarMargin();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('7');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch {
        // Analytics will remain empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, period, router]);

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      
      <main className={`min-h-screen transition-all duration-300 ${sidebarMargin}`}>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-cyber font-bold flex items-center gap-3">
                <BarChart2 className="w-8 h-8 text-neon-cyan" />
                Analytics
              </h1>
              <p className="text-gray-400 mt-1">Track your learning journey</p>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2">
              {[
                { id: '7', label: '7 Days' },
                { id: '14', label: '14 Days' },
                { id: '30', label: '30 Days' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    period === p.id
                      ? 'bg-neon-cyan text-black'
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : !analytics ? (
            <Card className="text-center py-12">
              <BarChart2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-cyber text-gray-400 mb-2">No data yet</h3>
              <p className="text-gray-500">Complete some quizzes to see your analytics!</p>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    icon: Target,
                    label: 'Quizzes Completed',
                    value: analytics.summary.totalQuizzes,
                    color: 'from-neon-cyan to-blue-500',
                    textColor: 'text-cyan-400',
                  },
                  {
                    icon: Zap,
                    label: 'XP Earned',
                    value: analytics.summary.totalXp.toLocaleString(),
                    color: 'from-yellow-500 to-orange-500',
                    textColor: 'text-yellow-400',
                  },
                  {
                    icon: CheckCircle,
                    label: 'Accuracy',
                    value: `${analytics.summary.accuracy}%`,
                    color: 'from-green-500 to-emerald-500',
                    textColor: 'text-green-400',
                  },
                  {
                    icon: Trophy,
                    label: 'Perfect Scores',
                    value: analytics.summary.perfectQuizzes,
                    color: 'from-purple-500 to-pink-500',
                    textColor: 'text-purple-400',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                      <div className="relative z-10">
                        <stat.icon className={`w-5 h-5 ${stat.textColor} mb-2`} />
                        <div className="text-2xl font-cyber font-bold">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* XP Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <Card>
                  <h3 className="font-cyber text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neon-cyan" />
                    XP Over Time
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chartData}>
                        <defs>
                          <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#666"
                          tick={{ fill: '#666', fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            background: '#1a1a28',
                            border: '1px solid rgba(0, 255, 255, 0.2)',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="xp"
                          stroke="#00ffff"
                          strokeWidth={2}
                          fill="url(#xpGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              {/* Category Stats & Insights */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Category Performance */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <h3 className="font-cyber text-lg mb-4">Category Performance</h3>
                    {analytics.categoryStats.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No category data yet</p>
                    ) : (
                      <div className="space-y-4">
                        {analytics.categoryStats.map((cat) => {
                          const accuracy = cat.total > 0 ? (cat.correct / cat.total) * 100 : 0;
                          return (
                            <div key={cat.name}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">{cat.name}</span>
                                <span className="text-sm text-gray-400">
                                  {cat.quizzes} quizzes • {accuracy.toFixed(0)}% accuracy
                                </span>
                              </div>
                              <ProgressBar 
                                value={accuracy} 
                                max={100}
                                color="cyan"
                                size="sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* Insights */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <h3 className="font-cyber text-lg mb-4">Insights</h3>
                    <div className="space-y-4">
                      {analytics.bestCategory && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="flex items-center gap-2 text-green-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">Best Performance</span>
                          </div>
                          <p className="text-sm text-gray-300">
                            You&apos;re crushing it in <span className="text-green-400 font-bold">{analytics.bestCategory.name}</span>!
                            Keep it up!
                          </p>
                        </div>
                      )}

                      {analytics.worstCategory && analytics.worstCategory.name !== analytics.bestCategory?.name && (
                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                          <div className="flex items-center gap-2 text-orange-400 mb-1">
                            <Target className="w-4 h-4" />
                            <span className="font-medium">Room for Growth</span>
                          </div>
                          <p className="text-sm text-gray-300">
                            Practice more in <span className="text-orange-400 font-bold">{analytics.worstCategory.name}</span> to
                            improve your overall score.
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                          <Flame className="w-4 h-4" />
                          <span className="font-medium">Daily Tip</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Maintain your streak by completing at least one quiz every day.
                          Consistency is key to mastery!
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
