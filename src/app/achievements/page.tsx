'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { Card, Badge, ProgressBar } from '@/components/ui/Elements';
import { cn, rarityColors } from '@/lib/utils';
import { Award, Lock, Star, Sparkles, Trophy, Flame, Zap, Target } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  gemReward: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  isSecret: boolean;
}

export default function AchievementsPage() {
  const router = useRouter();
  const { token } = useAuthStore();  const sidebarMargin = useSidebarMargin();  const [achievements, setAchievements] = useState<{
    unlocked: Achievement[];
    locked: Achievement[];
    secret: number;
    total: number;
    unlockedCount: number;
  }>({ unlocked: [], locked: [], secret: 0, total: 0, unlockedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: Star },
    { id: 'GENERAL', label: 'General', icon: Award },
    { id: 'STREAK', label: 'Streak', icon: Flame },
    { id: 'ACCURACY', label: 'Accuracy', icon: Target },
    { id: 'MASTERY', label: 'Mastery', icon: Trophy },
    { id: 'SPECIAL', label: 'Special', icon: Sparkles },
  ];

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAchievements = async () => {
      try {
        const res = await fetch('/api/achievements', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAchievements(data);
        }
      } catch {
        // Achievements will remain empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [token, router]);

  const filteredUnlocked = selectedCategory === 'all' 
    ? achievements.unlocked 
    : achievements.unlocked.filter(a => a.category === selectedCategory);

  const filteredLocked = selectedCategory === 'all'
    ? achievements.locked
    : achievements.locked.filter(a => a.category === selectedCategory);

  const getRarityGradient = (rarity: string) => {
    const gradients: Record<string, string> = {
      COMMON: 'from-gray-400 to-gray-600',
      UNCOMMON: 'from-green-400 to-green-600',
      RARE: 'from-blue-400 to-blue-600',
      EPIC: 'from-purple-400 to-purple-600',
      LEGENDARY: 'from-yellow-400 to-orange-500',
      MYTHIC: 'from-pink-400 to-purple-500',
    };
    return gradients[rarity] || gradients.COMMON;
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      
      <main className={`min-h-screen transition-all duration-300 ${sidebarMargin}`}>
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-cyber font-bold mb-2">Achievements</h1>
            <p className="text-gray-400">Collect them all and become legendary</p>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-cyber text-lg">Collection Progress</h3>
                    <p className="text-gray-400 text-sm">
                      {achievements.unlockedCount} of {achievements.total} achievements unlocked
                    </p>
                  </div>
                  <div className="text-3xl font-cyber font-bold text-purple-400">
                    {achievements.total > 0 
                      ? Math.round((achievements.unlockedCount / achievements.total) * 100)
                      : 0}%
                  </div>
                </div>
                <ProgressBar 
                  value={achievements.unlockedCount} 
                  max={achievements.total}
                  color="purple"
                  size="lg"
                />
                {achievements.secret > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    + {achievements.secret} secret achievements to discover
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* Unlocked Achievements */}
              {filteredUnlocked.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-cyber font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Unlocked ({filteredUnlocked.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUnlocked.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="relative overflow-hidden achievement-card unlocked h-full">
                          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(achievement.rarity)} opacity-10`} />
                          <div className="relative z-10">
                            <div className="flex items-start gap-3">
                              <div 
                                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${getRarityGradient(achievement.rarity)}`}
                              >
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-cyber">{achievement.name}</h3>
                                </div>
                                <Badge 
                                  variant={
                                    achievement.rarity === 'LEGENDARY' || achievement.rarity === 'MYTHIC' 
                                      ? 'warning' 
                                      : achievement.rarity === 'EPIC' 
                                        ? 'purple' 
                                        : achievement.rarity === 'RARE'
                                          ? 'cyan'
                                          : 'success'
                                  }
                                  size="sm"
                                >
                                  {achievement.rarity}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-3">{achievement.description}</p>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                              <Badge variant="cyan" size="sm">+{achievement.xpReward} XP</Badge>
                              {achievement.gemReward > 0 && (
                                <Badge variant="purple" size="sm">+{achievement.gemReward} 💎</Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Locked Achievements */}
              {filteredLocked.length > 0 && (
                <section>
                  <h2 className="text-xl font-cyber font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-400" />
                    Locked ({filteredLocked.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLocked.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="relative overflow-hidden achievement-card locked h-full">
                          <div className="relative z-10">
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gray-700/50">
                                <Lock className="w-6 h-6 text-gray-500" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-cyber text-gray-400">{achievement.name}</h3>
                                <Badge variant="default" size="sm">{achievement.rarity}</Badge>
                              </div>
                            </div>
                            <p className="text-gray-500 text-sm mt-3">{achievement.description}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
