'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Badge, Avatar } from '@/components/ui/Elements';
import { getAvatarUrl, cn, formatNumber } from '@/lib/utils';
import { Trophy, Medal, Flame, Zap, Crown, TrendingUp } from 'lucide-react';

const periods = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarStyle: string;
  avatarSeed: string;
  level: number;
  streak: number;
  xpEarned: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRankings(data.rankings);
          setCurrentUserRank(data.currentUserRank);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token, selectedPeriod, router]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-orange-500/20 to-yellow-600/20 border-orange-500/30';
      default:
        return 'border-white/5';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-cyber font-bold mb-2">Leaderboard</h1>
            <p className="text-gray-400">Compete with the best minds</p>
          </motion.div>

          {/* Period Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  selectedPeriod === period.id
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black'
                    : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
                )}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Current User Rank */}
          {currentUserRank && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="relative overflow-hidden border border-neon-cyan/30">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="text-3xl font-cyber font-bold text-neon-cyan">
                    #{currentUserRank.rank}
                  </div>
                  <Avatar
                    src={getAvatarUrl(user.avatarStyle, user.avatarSeed)}
                    alt={user.username}
                    size="lg"
                    level={user.level}
                  />
                  <div className="flex-1">
                    <h3 className="font-cyber text-lg text-neon-cyan">
                      {user.displayName || user.username}
                    </h3>
                    <p className="text-gray-400 text-sm">Your current position</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-cyber font-bold text-yellow-400">
                      {formatNumber(currentUserRank.xpEarned)}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-end gap-1">
                      <Zap className="w-4 h-4" /> XP earned
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Rankings */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : rankings.length === 0 ? (
            <Card className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-cyber text-gray-400 mb-2">No rankings yet</h3>
              <p className="text-gray-500">Be the first to claim the throne!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {rankings.slice(0, 20).map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'flex items-center gap-4 border',
                      getRankBg(entry.rank),
                      entry.userId === user?.id && 'ring-2 ring-neon-cyan/50'
                    )}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {getRankIcon(entry.rank) || (
                        <span className="text-2xl font-cyber font-bold text-gray-500">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      src={getAvatarUrl(entry.avatarStyle, entry.avatarSeed)}
                      alt={entry.username}
                      size="md"
                      level={entry.level}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-cyber truncate">
                        {entry.displayName || entry.username}
                        {entry.userId === user?.id && (
                          <span className="ml-2 text-xs text-neon-cyan">(You)</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>Level {entry.level}</span>
                        {entry.streak > 0 && (
                          <span className="flex items-center gap-1 text-orange-400">
                            <Flame className="w-3 h-3" />
                            {entry.streak}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="text-lg font-cyber font-bold text-yellow-400 flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {formatNumber(entry.xpEarned)}
                      </div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
