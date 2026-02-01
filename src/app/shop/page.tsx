'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gem, Coins, ShoppingBag, Zap, Shield, Clock, Target,
  Star, Palette, Award, Lock, Check,
  Flame, Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import {
  AnimatedBorder, MeteorShower
} from '@/components/ui/MagicUI';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  gemPrice: number | null;
  coinPrice: number | null;
  avatarStyle?: string;
  effectData?: string;
  isLimited?: boolean;
  stock?: number;
}

const ITEM_ICONS: Record<string, React.ElementType> = {
  AVATAR_STYLE: Palette,
  XP_BOOST: Zap,
  STREAK_FREEZE: Shield,
  HINT_PACK: Target,
  TIME_BOOST: Clock,
  SPECIAL_BADGE: Award,
};

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'from-gray-600/20 to-gray-700/20', border: 'border-gray-500/50', text: 'text-gray-300' },
  rare: { bg: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  epic: { bg: 'from-purple-600/20 to-pink-600/20', border: 'border-purple-500/50', text: 'text-purple-400' },
  legendary: { bg: 'from-yellow-600/20 to-orange-600/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
};

// Item Card Component
const ShopItemCard = ({
  item,
  onBuy,
  userGems,
  userCoins,
  owned
}: {
  item: ShopItem;
  onBuy: (item: ShopItem) => void;
  userGems: number;
  userCoins: number;
  owned: boolean;
}) => {
  const Icon = ITEM_ICONS[item.type] || Package;
  const canAffordGems = item.gemPrice ? userGems >= item.gemPrice : true;
  const canAffordCoins = item.coinPrice ? userCoins >= item.coinPrice : true;
  const canAfford = item.gemPrice ? canAffordGems : canAffordCoins;

  const rarity = item.gemPrice && item.gemPrice >= 100 ? 'legendary' :
                 item.gemPrice && item.gemPrice >= 50 ? 'epic' :
                 item.gemPrice && item.gemPrice >= 25 ? 'rare' : 'common';
  
  const colors = RARITY_COLORS[rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      className={`relative bg-gradient-to-br ${colors.bg} backdrop-blur-sm rounded-2xl p-6 border ${colors.border} transition-all overflow-hidden group`}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{ y: ['100%', '-100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Limited badge */}
      {item.isLimited && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Flame className="w-3 h-3" />
          LIMITED
        </div>
      )}

      {/* Owned badge */}
      {owned && (
        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Check className="w-3 h-3" />
          OWNED
        </div>
      )}

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 mx-auto`}
        >
          {item.type === 'AVATAR_STYLE' && item.avatarStyle ? (
            <img
              src={`https://api.dicebear.com/7.x/${item.avatarStyle}/svg?seed=preview`}
              alt={item.name}
              className="w-12 h-12 rounded-lg"
            />
          ) : (
            <Icon className={`w-8 h-8 ${colors.text}`} />
          )}
        </motion.div>

        {/* Info */}
        <h3 className="text-lg font-bold text-white text-center mb-1">{item.name}</h3>
        <p className="text-sm text-gray-400 text-center mb-4 line-clamp-2">{item.description}</p>

        {/* Price & Buy Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.gemPrice ? (
              <>
                <Gem className={`w-5 h-5 ${canAffordGems ? 'text-purple-400' : 'text-gray-500'}`} />
                <span className={`font-bold ${canAffordGems ? 'text-purple-400' : 'text-gray-500'}`}>
                  {item.gemPrice}
                </span>
              </>
            ) : (
              <>
                <Coins className={`w-5 h-5 ${canAffordCoins ? 'text-yellow-400' : 'text-gray-500'}`} />
                <span className={`font-bold ${canAffordCoins ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {item.coinPrice}
                </span>
              </>
            )}
          </div>

          <motion.button
            whileHover={{ scale: canAfford && !owned ? 1.05 : 1 }}
            whileTap={{ scale: canAfford && !owned ? 0.95 : 1 }}
            onClick={() => canAfford && !owned && onBuy(item)}
            disabled={!canAfford || owned}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              owned ? 'bg-green-500/20 text-green-400 cursor-default' :
              canAfford
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {owned ? (
              <>
                <Check className="w-4 h-4" />
                Owned
              </>
            ) : canAfford ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                Buy
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Locked
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Featured item with big display
const FeaturedItem = ({
  item,
  onBuy,
  userGems,
  userCoins
}: {
  item: ShopItem;
  onBuy: (item: ShopItem) => void;
  userGems: number;
  userCoins: number;
}) => {
  const Icon = ITEM_ICONS[item.type] || Package;
  const canAffordGems = item.gemPrice ? userGems >= item.gemPrice : true;
  const canAffordCoins = item.coinPrice ? userCoins >= item.coinPrice : true;
  const canAfford = item.gemPrice ? canAffordGems : canAffordCoins;

  return (
    <AnimatedBorder className="rounded-2xl">
      <div className="bg-gradient-to-br from-purple-900/40 via-gray-900/90 to-pink-900/40 rounded-2xl p-8 relative overflow-hidden">
        {/* Background effects */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative z-10 flex items-center gap-8">
          {/* Large Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 flex items-center justify-center"
          >
            <Icon className="w-16 h-16 text-purple-300" />
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                FEATURED
              </span>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-medium px-3 py-1 rounded-full">
                Limited Time
              </span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">{item.name}</h2>
            <p className="text-gray-300 mb-4 max-w-md">{item.description}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {item.gemPrice ? (
                  <>
                    <Gem className="w-6 h-6 text-purple-400" />
                    <span className="text-2xl font-bold text-purple-400">{item.gemPrice}</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">{item.coinPrice}</span>
                  </>
                )}
              </div>

              <motion.button
                whileHover={{ scale: canAfford ? 1.05 : 1 }}
                whileTap={{ scale: canAfford ? 0.95 : 1 }}
                onClick={() => canAfford && onBuy(item)}
                disabled={!canAfford}
                className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all ${
                  canAfford
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAfford ? (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Purchase Now
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Not Enough {item.gemPrice ? 'Gems' : 'Coins'}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBorder>
  );
};

// Purchase confirmation modal
const PurchaseModal = ({
  item,
  onConfirm,
  onCancel,
  processing
}: {
  item: ShopItem;
  onConfirm: () => void;
  onCancel: () => void;
  processing: boolean;
}) => {
  const Icon = ITEM_ICONS[item.type] || Package;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 flex items-center justify-center mx-auto mb-6"
          >
            <Icon className="w-10 h-10 text-purple-300" />
          </motion.div>

          <h3 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to buy <span className="text-white font-medium">{item.name}</span>?
          </p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              {item.gemPrice ? (
                <>
                  <Gem className="w-6 h-6 text-purple-400" />
                  <span className="text-2xl font-bold text-purple-400">{item.gemPrice} Gems</span>
                </>
              ) : (
                <>
                  <Coins className="w-6 h-6 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">{item.coinPrice} Coins</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={processing}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirm
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Success animation modal
const SuccessModal = ({ item, onClose }: { item: ShopItem; onClose: () => void }) => {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        {/* Confetti/particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300,
              scale: [0, 1, 0],
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.5, delay: i * 0.02 }}
            className={`absolute top-1/2 left-1/2 w-3 h-3 ${
              ['bg-purple-400', 'bg-pink-400', 'bg-cyan-400', 'bg-yellow-400'][i % 4]
            } rounded-full`}
          />
        ))}

        <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-10 text-center border border-purple-500/50">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-white mb-2"
          >
            Purchase Complete!
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-6"
          >
            You now own <span className="text-purple-300 font-bold">{item.name}</span>
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Awesome!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ShopPage() {
  useRouter(); // Keep for navigation readiness
  const { user, token, setUser } = useAuthStore();
  const sidebarMargin = useSidebarMargin();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseItem, setPurchaseItem] = useState<ShopItem | null>(null);
  const [successItem, setSuccessItem] = useState<ShopItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'AVATAR_STYLE', name: 'Avatars', icon: Palette },
    { id: 'XP_BOOST', name: 'XP Boosts', icon: Zap },
    { id: 'STREAK_FREEZE', name: 'Streak Freeze', icon: Shield },
    { id: 'SPECIAL_BADGE', name: 'Badges', icon: Award },
  ];

  // Mock shop items
  const mockItems: ShopItem[] = [
    { id: '1', name: 'Cyber Avatar', description: 'A futuristic cyberpunk avatar style', type: 'AVATAR_STYLE', gemPrice: 50, coinPrice: null, avatarStyle: 'avataaars' },
    { id: '2', name: 'Pixel Avatar', description: 'Retro pixel art avatar', type: 'AVATAR_STYLE', gemPrice: null, coinPrice: 500, avatarStyle: 'pixel-art' },
    { id: '3', name: 'Bot Avatar', description: 'Robotic avatar for tech lovers', type: 'AVATAR_STYLE', gemPrice: 75, coinPrice: null, avatarStyle: 'bottts' },
    { id: '4', name: 'Fun Emoji Avatar', description: 'Expressive emoji-style avatar', type: 'AVATAR_STYLE', gemPrice: null, coinPrice: 300, avatarStyle: 'fun-emoji' },
    { id: '5', name: '2x XP Boost', description: 'Double XP for your next quiz', type: 'XP_BOOST', gemPrice: 25, coinPrice: null },
    { id: '6', name: '3x XP Mega Boost', description: 'Triple XP for your next 3 quizzes', type: 'XP_BOOST', gemPrice: 60, coinPrice: null, isLimited: true },
    { id: '7', name: 'Streak Freeze', description: 'Protect your streak for one day', type: 'STREAK_FREEZE', gemPrice: 30, coinPrice: null },
    { id: '8', name: 'Streak Shield (3 Days)', description: 'Protect your streak for 3 days', type: 'STREAK_FREEZE', gemPrice: 75, coinPrice: null, isLimited: true },
    { id: '9', name: 'Hint Pack (10)', description: '10 hints to eliminate wrong answers', type: 'HINT_PACK', gemPrice: null, coinPrice: 200 },
    { id: '10', name: 'Time Boost', description: 'Add 30 seconds to any quiz', type: 'TIME_BOOST', gemPrice: 20, coinPrice: null },
    { id: '11', name: 'Champion Badge', description: 'Exclusive champion profile badge', type: 'SPECIAL_BADGE', gemPrice: 100, coinPrice: null },
    { id: '12', name: 'Legend Badge', description: 'Legendary profile badge', type: 'SPECIAL_BADGE', gemPrice: 200, coinPrice: null, isLimited: true },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.type === selectedCategory);

  const featuredItem = items.find(item => item.isLimited && item.gemPrice && item.gemPrice >= 100);

  const handleBuy = (item: ShopItem) => {
    setPurchaseItem(item);
  };

  const confirmPurchase = async () => {
    if (!purchaseItem || !user || !token) return;

    setProcessing(true);

    try {
      // Make API call to purchase item
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: purchaseItem.id,
          itemType: purchaseItem.type,
          gemPrice: purchaseItem.gemPrice,
          coinPrice: purchaseItem.coinPrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Purchase failed');
        setProcessing(false);
        setPurchaseItem(null);
        return;
      }

      const data = await response.json();

      // Update user balance with backend response
      if (data.user) {
        setUser(data.user);
      }

      setOwnedItems([...ownedItems, purchaseItem.id]);
      setProcessing(false);
      setPurchaseItem(null);
      setSuccessItem(purchaseItem);
    } catch {
      alert('Failed to complete purchase. Please try again.');
      setProcessing(false);
      setPurchaseItem(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20" />
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
                <ShoppingBag className="w-10 h-10 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  NEXUS SHOP
                </span>
              </h1>
              <p className="text-gray-400 mt-1">Power-ups, avatars, and exclusive items</p>
            </div>

            {/* User balance */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-yellow-500/30">
                <Coins className="w-6 h-6 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">{user?.coins || 0}</span>
              </div>
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-purple-500/30">
                <Gem className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold text-purple-400">{user?.gems || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Featured Item */}
          {featuredItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <FeaturedItem
                item={featuredItem}
                onBuy={handleBuy}
                userGems={user?.gems || 0}
                userCoins={user?.coins || 0}
              />
            </motion.div>
          )}

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 mb-8 overflow-x-auto pb-2"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Items Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ShopItemCard
                    item={item}
                    onBuy={handleBuy}
                    userGems={user?.gems || 0}
                    userCoins={user?.coins || 0}
                    owned={ownedItems.includes(item.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No items found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {purchaseItem && (
            <PurchaseModal
              item={purchaseItem}
              onConfirm={confirmPurchase}
              onCancel={() => setPurchaseItem(null)}
              processing={processing}
            />
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {successItem && (
            <SuccessModal
              item={successItem}
              onClose={() => setSuccessItem(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
