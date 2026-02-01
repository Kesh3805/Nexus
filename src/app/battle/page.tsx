'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Users, Trophy, Zap, Shield, Target, Crown,
  Flame, ChevronRight, Play, Search, X, Check,
  UserPlus, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import {
  AnimatedBorder,
  MeteorShower, CyberGrid
} from '@/components/ui/MagicUI';

interface BattleRoom {
  id: string;
  name: string;
  host: {
    id: string;
    username: string;
    displayName: string | null;
    avatarStyle: string;
    level: number;
  };
  category: string;
  difficulty: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'starting' | 'in-progress';
  prize: number;
}

interface Player {
  id: string;
  username: string;
  displayName: string | null;
  avatarStyle: string;
  level: number;
  score: number;
  isReady: boolean;
  isHost: boolean;
}

// Live player count indicator
const LiveIndicator = () => (
  <div className="flex items-center gap-2">
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-2 h-2 rounded-full bg-green-500"
    />
    <span className="text-sm text-green-400">LIVE</span>
  </div>
);

// Battle room card
const BattleRoomCard = ({
  room,
  onJoin
}: {
  room: BattleRoom;
  onJoin: (room: BattleRoom) => void;
}) => {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border transition-all overflow-hidden ${
        room.status === 'waiting' ? 'border-cyan-500/30 hover:border-cyan-500/60' :
        room.status === 'starting' ? 'border-yellow-500/30' :
        'border-gray-700/50'
      }`}
    >
      {/* Status badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
        room.status === 'waiting' ? 'bg-cyan-500/20 text-cyan-400' :
        room.status === 'starting' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {room.status === 'waiting' ? 'Waiting' : 
         room.status === 'starting' ? 'Starting Soon' : 'In Progress'}
      </div>

      <div className="flex items-start gap-4 mb-4">
        {/* Host avatar */}
        <div className="relative">
          <img
            src={`https://api.dicebear.com/7.x/${room.host.avatarStyle}/svg?seed=${room.host.username}`}
            alt={room.host.username}
            className="w-14 h-14 rounded-xl bg-gray-700"
          />
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
            <Crown className="w-3 h-3 text-gray-900" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{room.name}</h3>
          <p className="text-sm text-gray-400">Hosted by {room.host.displayName || room.host.username}</p>
        </div>
      </div>

      {/* Room info */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-xs text-gray-400">{room.category}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <div className="text-xs text-gray-400">{room.difficulty}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-xs text-gray-400">{room.prize} XP</div>
        </div>
      </div>

      {/* Players */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            <span className={room.currentPlayers === room.maxPlayers ? 'text-red-400' : 'text-cyan-400'}>
              {room.currentPlayers}
            </span>
            /{room.maxPlayers} players
          </span>
        </div>
        <div className="flex -space-x-2">
          {[...Array(Math.min(room.currentPlayers, 4))].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800"
              style={{ zIndex: 4 - i }}
            />
          ))}
          {room.currentPlayers > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-400">
              +{room.currentPlayers - 4}
            </div>
          )}
        </div>
      </div>

      {/* Join button */}
      <motion.button
        whileHover={{ scale: isFull || room.status !== 'waiting' ? 1 : 1.02 }}
        whileTap={{ scale: isFull || room.status !== 'waiting' ? 1 : 0.98 }}
        onClick={() => !isFull && room.status === 'waiting' && onJoin(room)}
        disabled={isFull || room.status !== 'waiting'}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          isFull || room.status !== 'waiting'
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
        }`}
      >
        {isFull ? (
          <>Room Full</>
        ) : room.status !== 'waiting' ? (
          <>
            <Eye className="w-4 h-4" />
            Spectate
          </>
        ) : (
          <>
            <Swords className="w-4 h-4" />
            Join Battle
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

// Quick match finding animation
const MatchFinding = ({ onCancel }: { onCancel: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div className="text-center">
      {/* Animated rings */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"
            animate={{
              scale: [1, 2, 2],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          />
        ))}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-8 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-16 border-4 border-purple-500 border-b-transparent rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Swords className="w-12 h-12 text-cyan-400" />
        </div>
      </div>

      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl font-bold text-white mb-2"
      >
        Finding Opponent...
      </motion.h2>
      <p className="text-gray-400 mb-8">Matching you with a worthy challenger</p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="px-8 py-3 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
      >
        Cancel
      </motion.button>
    </div>
  </motion.div>
);

// Create room modal
const CreateRoomModal = ({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (data: { name: string; category: string; difficulty: string; maxPlayers: number }) => void;
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Science');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [maxPlayers, setMaxPlayers] = useState(4);

  const categories = ['Science', 'Technology', 'History', 'Geography', 'Entertainment', 'Mixed'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-cyan-400" />
            Create Battle Room
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Room name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    difficulty === diff
                      ? diff === 'EASY' ? 'bg-green-500 text-white' :
                        diff === 'MEDIUM' ? 'bg-yellow-500 text-gray-900' :
                        'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Max players */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Players</label>
            <div className="flex items-center gap-4">
              {[2, 4, 6, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setMaxPlayers(num)}
                  className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                    maxPlayers === num
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCreate({ name: name || 'Battle Room', category, difficulty, maxPlayers })}
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <Swords className="w-5 h-5" />
            Create Room
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Battle lobby
const BattleLobby = ({
  room,
  players,
  onLeave,
  onStart,
  isHost,
  isReady,
  onToggleReady
}: {
  room: BattleRoom;
  players: Player[];
  onLeave: () => void;
  onStart: () => void;
  isHost: boolean;
  isReady: boolean;
  onToggleReady: () => void;
}) => {
  const allReady = players.filter(p => !p.isHost).every(p => p.isReady);
  const canStart = players.length >= 2 && allReady;

  return (
    <div className="fixed inset-0 bg-gray-950 z-40">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Swords className="w-7 h-7 text-cyan-400" />
                {room.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {room.category}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {room.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {room.prize} XP
                </span>
              </div>
            </div>
            <button
              onClick={onLeave}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Players grid */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Players ({players.length}/{room.maxPlayers})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-gray-800/60 rounded-2xl p-6 text-center border-2 transition-all ${
                    player.isReady || player.isHost
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-gray-700/50'
                  }`}
                >
                  {/* Host/Ready badge */}
                  {player.isHost ? (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      HOST
                    </div>
                  ) : player.isReady && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      READY
                    </div>
                  )}

                  <motion.img
                    animate={player.isReady || player.isHost ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    src={`https://api.dicebear.com/7.x/${player.avatarStyle}/svg?seed=${player.username}`}
                    alt={player.username}
                    className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-700"
                  />
                  <h3 className="font-bold text-white truncate">
                    {player.displayName || player.username}
                  </h3>
                  <p className="text-sm text-gray-400">Level {player.level}</p>
                </motion.div>
              ))}

              {/* Empty slots */}
              {[...Array(room.maxPlayers - players.length)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-gray-800/30 rounded-2xl p-6 text-center border-2 border-dashed border-gray-700/50"
                >
                  <div className="w-20 h-20 rounded-full bg-gray-800/50 mx-auto mb-3 flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-medium">Waiting...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {canStart ? (
                <span className="text-green-400">All players ready! Start the battle!</span>
              ) : (
                <span>Waiting for all players to be ready...</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isHost && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onToggleReady}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    isReady
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isReady ? (
                    <>
                      <Check className="w-5 h-5" />
                      Ready!
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Ready Up
                    </>
                  )}
                </motion.button>
              )}

              {isHost && (
                <motion.button
                  whileHover={{ scale: canStart ? 1.02 : 1 }}
                  whileTap={{ scale: canStart ? 0.98 : 1 }}
                  onClick={canStart ? onStart : undefined}
                  disabled={!canStart}
                  className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    canStart
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  Start Battle
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BattleModePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const sidebarMargin = useSidebarMargin();
  const [rooms, setRooms] = useState<BattleRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [findingMatch, setFindingMatch] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<BattleRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineCount, setOnlineCount] = useState(127);

  // Mock rooms
  const mockRooms: BattleRoom[] = [
    {
      id: '1',
      name: 'Science Showdown',
      host: { id: '1', username: 'QuantumKing', displayName: 'Quantum King', avatarStyle: 'adventurer', level: 25 },
      category: 'Science',
      difficulty: 'MEDIUM',
      maxPlayers: 4,
      currentPlayers: 2,
      status: 'waiting',
      prize: 500,
    },
    {
      id: '2',
      name: 'History Legends',
      host: { id: '2', username: 'TimeTraveler', displayName: 'Time Traveler', avatarStyle: 'avataaars', level: 18 },
      category: 'History',
      difficulty: 'HARD',
      maxPlayers: 6,
      currentPlayers: 5,
      status: 'starting',
      prize: 750,
    },
    {
      id: '3',
      name: 'Tech Titans',
      host: { id: '3', username: 'CyberNinja', displayName: null, avatarStyle: 'bottts', level: 32 },
      category: 'Technology',
      difficulty: 'EASY',
      maxPlayers: 4,
      currentPlayers: 4,
      status: 'in-progress',
      prize: 400,
    },
    {
      id: '4',
      name: 'Mixed Madness',
      host: { id: '4', username: 'QuizMaster', displayName: 'Quiz Master', avatarStyle: 'pixel-art', level: 45 },
      category: 'Mixed',
      difficulty: 'MEDIUM',
      maxPlayers: 8,
      currentPlayers: 3,
      status: 'waiting',
      prize: 600,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setRooms(mockRooms);
      setLoading(false);
    }, 500);

    // Simulate online count changes
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickMatch = () => {
    setFindingMatch(true);
    // Simulate finding match
    setTimeout(() => {
      setFindingMatch(false);
      handleJoinRoom(mockRooms[0]);
    }, 3000);
  };

  const handleJoinRoom = (room: BattleRoom) => {
    setCurrentRoom(room);
    setPlayers([
      {
        id: user?.id || 'current',
        username: user?.username || 'You',
        displayName: user?.displayName || null,
        avatarStyle: user?.avatarStyle || 'adventurer',
        level: user?.level || 1,
        score: 0,
        isReady: false,
        isHost: false,
      },
      {
        ...room.host,
        score: 0,
        isReady: true,
        isHost: true,
      },
    ]);
  };

  const handleCreateRoom = (data: { name: string; category: string; difficulty: string; maxPlayers: number }) => {
    const newRoom: BattleRoom = {
      id: Date.now().toString(),
      name: data.name,
      host: {
        id: user?.id || 'current',
        username: user?.username || 'You',
        displayName: user?.displayName || null,
        avatarStyle: user?.avatarStyle || 'adventurer',
        level: user?.level || 1,
      },
      category: data.category,
      difficulty: data.difficulty,
      maxPlayers: data.maxPlayers,
      currentPlayers: 1,
      status: 'waiting',
      prize: data.difficulty === 'EASY' ? 300 : data.difficulty === 'MEDIUM' ? 500 : 800,
    };

    setCurrentRoom(newRoom);
    setPlayers([{
      id: user?.id || 'current',
      username: user?.username || 'You',
      displayName: user?.displayName || null,
      avatarStyle: user?.avatarStyle || 'adventurer',
      level: user?.level || 1,
      score: 0,
      isReady: true,
      isHost: true,
    }]);
    setShowCreateModal(false);
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.host.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main className={`flex-1 relative overflow-hidden transition-all duration-300 ${sidebarMargin}`}>
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-gray-950 to-blue-900/20" />
          <CyberGrid />
          <MeteorShower />
        </div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-black flex items-center gap-3">
                <Swords className="w-10 h-10 text-cyan-400" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BATTLE MODE
                </span>
              </h1>
              <p className="text-gray-400 mt-1">Challenge players in real-time quiz battles</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3 border border-green-500/30">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className="text-green-400 font-medium">{onlineCount} Online</span>
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Quick Match */}
            <AnimatedBorder className="rounded-2xl">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQuickMatch}
                className="w-full bg-gradient-to-br from-cyan-900/60 via-gray-900/90 to-blue-900/60 rounded-2xl p-8 text-left group"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border border-cyan-500/50"
                  >
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">Quick Match</h2>
                    <p className="text-gray-400">Find an opponent instantly</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 ml-auto group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.button>
            </AnimatedBorder>

            {/* Create Room */}
            <AnimatedBorder className="rounded-2xl">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-br from-purple-900/60 via-gray-900/90 to-pink-900/60 rounded-2xl p-8 text-left group"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-500/50"
                  >
                    <Swords className="w-8 h-8 text-purple-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">Create Room</h2>
                    <p className="text-gray-400">Host your own battle</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 ml-auto group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.button>
            </AnimatedBorder>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms by name, category, or host..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </motion.div>

          {/* Rooms header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Available Rooms
              <span className="text-sm text-gray-400 font-normal">({filteredRooms.length})</span>
            </h2>
            <LiveIndicator />
          </motion.div>

          {/* Rooms grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <BattleRoomCard room={room} onJoin={handleJoinRoom} />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty state */}
          {filteredRooms.length === 0 && (
            <div className="text-center py-16">
              <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No rooms found</h3>
              <p className="text-gray-500 mb-6">Create your own room to start battling!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
              >
                Create Room
              </motion.button>
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {findingMatch && <MatchFinding onCancel={() => setFindingMatch(false)} />}
          {showCreateModal && (
            <CreateRoomModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleCreateRoom}
            />
          )}
          {currentRoom && (
            <BattleLobby
              room={currentRoom}
              players={players}
              onLeave={() => {
                setCurrentRoom(null);
                setPlayers([]);
                setIsReady(false);
              }}
              onStart={() => router.push(`/quiz/${rooms[0]?.id}?battle=true`)}
              isHost={players[0]?.isHost || false}
              isReady={isReady}
              onToggleReady={() => setIsReady(!isReady)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
