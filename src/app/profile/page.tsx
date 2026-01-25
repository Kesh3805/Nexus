'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Shield, Bell, Palette, Trophy,
  Camera, Edit3, Save, X, Zap, Target, Clock,
  Star, Award, TrendingUp, Calendar, ChevronRight,
  LogOut, Trash2, Eye, EyeOff, Check, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

const AVATAR_STYLES = [
  'adventurer', 'adventurer-neutral', 'avataaars', 'avataaars-neutral',
  'big-ears', 'big-ears-neutral', 'big-smile', 'bottts', 'bottts-neutral',
  'croodles', 'croodles-neutral', 'dylan', 'fun-emoji', 'glass',
  'icons', 'identicon', 'initials', 'lorelei', 'lorelei-neutral',
  'micah', 'miniavs', 'notionists', 'notionists-neutral', 'open-peeps',
  'personas', 'pixel-art', 'pixel-art-neutral', 'rings', 'shapes', 'thumbs'
];

const THEMES = [
  { id: 'cyber', name: 'Cyber Neon', primary: '#00f5ff', secondary: '#ff00ff', bg: 'from-gray-900' },
  { id: 'ocean', name: 'Deep Ocean', primary: '#00d4ff', secondary: '#0099ff', bg: 'from-blue-950' },
  { id: 'aurora', name: 'Aurora', primary: '#00ff88', secondary: '#00ffcc', bg: 'from-emerald-950' },
  { id: 'sunset', name: 'Sunset', primary: '#ff6b6b', secondary: '#ffa500', bg: 'from-orange-950' },
  { id: 'galaxy', name: 'Galaxy', primary: '#a855f7', secondary: '#ec4899', bg: 'from-purple-950' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('adventurer');
  const [selectedTheme, setSelectedTheme] = useState('cyber');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    achievements: true,
    friends: true,
    challenges: true,
    reminders: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalXp: 0,
    accuracy: 0,
    streak: 0,
    achievements: 0,
    friends: 0,
    rank: 0,
    level: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
        });
        setStats({
          totalQuizzes: data.user._count?.quizAttempts || 0,
          totalXp: data.user.xp || 0,
          accuracy: 85, // Calculate from attempts
          streak: data.user.currentStreak || 0,
          achievements: data.user._count?.achievements || 0,
          friends: data.user._count?.friends || 0,
          rank: 42, // From leaderboard
          level: data.user.level || 1,
        });
        setSelectedAvatarStyle(data.user.avatarStyle || 'adventurer');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          avatarStyle: selectedAvatarStyle,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getAvatarUrl = (style: string) => {
    const seed = user?.email || 'default';
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=0a0a0a`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-cyan-500 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              Settings
            </span>
          </h1>
          <p className="text-gray-400 mt-2">Customize your Nexus experience</p>
        </motion.div>

        <div className="flex gap-8">
          {/* Tabs Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0"
          >
            <div className="glass-card rounded-2xl p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
              
              <div className="border-t border-white/10 my-4" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>

            {/* Quick Stats Card */}
            <div className="glass-card rounded-2xl p-6 mt-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Level</span>
                  <span className="text-cyan-400 font-bold">{stats.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total XP</span>
                  <span className="text-purple-400 font-bold">{stats.totalXp.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Streak</span>
                  <span className="text-orange-400 font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {stats.streak} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Global Rank</span>
                  <span className="text-yellow-400 font-bold">#{stats.rank}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Avatar Section */}
                  <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-start gap-8">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/25">
                          <img
                            src={getAvatarUrl(selectedAvatarStyle)}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => setShowAvatarPicker(true)}
                          className="absolute -bottom-2 -right-2 p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 
                            shadow-lg shadow-cyan-500/25 hover:scale-110 transition-transform"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                        
                        {/* Level Badge */}
                        <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 
                          text-white text-sm font-bold shadow-lg">
                          Lv.{stats.level}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-bold text-white">{formData.name || 'Anonymous'}</h2>
                            <p className="text-gray-400">{formData.email}</p>
                          </div>
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                              ${isEditing 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                              }`}
                          >
                            {isEditing ? (
                              <>
                                <X className="w-4 h-4" />
                                Cancel
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                              </>
                            )}
                          </button>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
                                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 transition-all outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Bio</label>
                              <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                placeholder="Tell us about yourself..."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
                                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 transition-all outline-none resize-none"
                              />
                            </div>
                            <button
                              onClick={handleSave}
                              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold
                                hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
                            >
                              <Save className="w-5 h-5" />
                              Save Changes
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-300">
                            {formData.bio || 'No bio yet. Click edit to add one!'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Quizzes Completed', value: stats.totalQuizzes, icon: Target, color: 'cyan' },
                      { label: 'Accuracy Rate', value: `${stats.accuracy}%`, icon: TrendingUp, color: 'green' },
                      { label: 'Achievements', value: stats.achievements, icon: Award, color: 'yellow' },
                      { label: 'Friends', value: stats.friends, icon: User, color: 'purple' },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-2xl p-6 text-center"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                        </div>
                        <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Account Created */}
                  <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Member Since</div>
                        <div className="text-gray-400">December 2024</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                      border border-cyan-500/30 text-cyan-400 font-medium">
                      Early Adopter
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Theme Selection */}
                  <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Palette className="w-6 h-6 text-cyan-400" />
                      Color Theme
                    </h3>
                    <div className="grid grid-cols-5 gap-4">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`relative p-4 rounded-2xl border-2 transition-all duration-300
                            ${selectedTheme === theme.id 
                              ? 'border-cyan-500 bg-cyan-500/10' 
                              : 'border-white/10 hover:border-white/30'
                            }`}
                        >
                          <div className="flex gap-2 mb-3">
                            <div 
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div 
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: theme.secondary }}
                            />
                          </div>
                          <div className="text-sm font-medium text-white">{theme.name}</div>
                          {selectedTheme === theme.id && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-5 h-5 text-cyan-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Style Selection */}
                  <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <User className="w-6 h-6 text-purple-400" />
                      Avatar Style
                    </h3>
                    <div className="grid grid-cols-6 gap-4">
                      {AVATAR_STYLES.slice(0, 12).map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedAvatarStyle(style)}
                          className={`relative p-2 rounded-xl border-2 transition-all duration-300
                            ${selectedAvatarStyle === style 
                              ? 'border-purple-500 bg-purple-500/10 scale-105' 
                              : 'border-white/10 hover:border-white/30'
                            }`}
                        >
                          <img
                            src={getAvatarUrl(style)}
                            alt={style}
                            className="w-full aspect-square rounded-lg"
                          />
                          {selectedAvatarStyle === style && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                    >
                      View all {AVATAR_STYLES.length} styles →
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-cyan-400" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'achievements', label: 'Achievement Unlocks', description: 'Get notified when you earn new achievements' },
                      { key: 'friends', label: 'Friend Activity', description: 'Updates about friend requests and activity' },
                      { key: 'challenges', label: 'Daily Challenges', description: 'Reminders about available daily challenges' },
                      { key: 'reminders', label: 'Study Reminders', description: 'Get reminded to maintain your streak' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div>
                          <div className="text-white font-medium">{item.label}</div>
                          <div className="text-sm text-gray-400">{item.description}</div>
                        </div>
                        <button
                          onClick={() => setNotifications({
                            ...notifications,
                            [item.key]: !notifications[item.key as keyof typeof notifications]
                          })}
                          className={`w-14 h-8 rounded-full transition-all duration-300 relative
                            ${notifications[item.key as keyof typeof notifications]
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                              : 'bg-gray-700'
                            }`}
                        >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300
                            ${notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-cyan-400" />
                      Privacy Settings
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: Eye, label: 'Profile Visibility', value: 'Public', options: ['Public', 'Friends Only', 'Private'] },
                        { icon: TrendingUp, label: 'Show on Leaderboard', value: 'Yes', options: ['Yes', 'No'] },
                        { icon: Trophy, label: 'Show Achievements', value: 'Public', options: ['Public', 'Friends Only', 'Hidden'] },
                      ].map((setting, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                              <setting.icon className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-white font-medium">{setting.label}</span>
                          </div>
                          <select
                            defaultValue={setting.value}
                            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white outline-none
                              focus:border-cyan-500 cursor-pointer"
                          >
                            {setting.options.map((opt) => (
                              <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="glass-card rounded-2xl p-8 border border-red-500/30">
                    <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                      <Trash2 className="w-6 h-6" />
                      Danger Zone
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/30
                        hover:bg-red-500/30 transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Choose Your Avatar</h3>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-6 gap-4">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setSelectedAvatarStyle(style);
                      setShowAvatarPicker(false);
                    }}
                    className={`relative p-2 rounded-xl border-2 transition-all duration-300 hover:scale-105
                      ${selectedAvatarStyle === style 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : 'border-white/10 hover:border-white/30'
                      }`}
                  >
                    <img
                      src={getAvatarUrl(style)}
                      alt={style}
                      className="w-full aspect-square rounded-lg"
                    />
                    <div className="mt-2 text-xs text-gray-400 truncate">{style}</div>
                    {selectedAvatarStyle === style && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-3xl p-8 max-w-md w-full border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Account?</h3>
                <p className="text-gray-400 mb-6">
                  This action cannot be undone. All your data, achievements, and progress will be permanently deleted.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
