import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// XP required for each level (exponential curve)
export function getXpForLevel(level: number): number {
  // Guard against invalid level values
  const validLevel = Math.max(1, Math.floor(level));
  return Math.floor(100 * Math.pow(1.5, validLevel - 1));
}

// Calculate level from total XP
export function getLevelFromXp(totalXp: number): { level: number; currentXp: number; nextLevelXp: number } {
  // Guard against negative XP values
  const safeXp = Math.max(0, Math.floor(totalXp));
  
  let level = 1;
  let xpNeeded = getXpForLevel(level);
  let remainingXp = safeXp;

  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = getXpForLevel(level);
  }

  return {
    level,
    currentXp: remainingXp,
    nextLevelXp: xpNeeded,
  };
}

// Format large numbers (1000 -> 1K, -1500 -> -1.5K)
export function formatNumber(num: number): string {
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return sign + (abs / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Format time (seconds to mm:ss)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Calculate streak bonus XP
export function getStreakBonus(streak: number, baseXp: number): number {
  if (streak <= 1) return 0;
  const multiplier = Math.min(streak * 0.1, 1); // Max 100% bonus at 10 streak
  return Math.floor(baseXp * multiplier);
}

// Get avatar URL from DiceBear
export function getAvatarUrl(style: string, seed: string): string {
  const safeSeed = encodeURIComponent(seed || 'default');
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}&backgroundColor=0a0a0a`;
}

// Difficulty colors
export const difficultyColors: Record<string, { bg: string; text: string; glow: string }> = {
  EASY: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/50' },
  MEDIUM: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  HARD: { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
  EXPERT: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/50' },
  NIGHTMARE: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/50' },
};

// Rarity colors
export const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  COMMON: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
  UNCOMMON: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  RARE: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  EPIC: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  LEGENDARY: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  MYTHIC: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500' },
};

// Encouragement messages
export const encouragements = {
  correct: [
    "🔥 You're on fire!",
    "⚡ Lightning fast!",
    "🚀 Stellar performance!",
    "💎 Brilliant!",
    "🎯 Bullseye!",
    "✨ Magnificent!",
    "🌟 Superstar!",
  ],
  incorrect: [
    "💪 Keep pushing!",
    "🔄 Try again next time!",
    "📚 Every mistake is a lesson!",
    "🌱 Growth mindset!",
    "🎮 Game on!",
  ],
  streak: [
    "🔥 Streak on fire!",
    "⚡ Unstoppable!",
    "🌊 Riding the wave!",
    "💫 Legendary streak!",
  ],
  perfect: [
    "🏆 PERFECT SCORE!",
    "👑 Flawless victory!",
    "💯 Absolute perfection!",
    "🌟 You're a genius!",
  ],
};

export function getRandomEncouragement(type: keyof typeof encouragements): string {
  const messages = encouragements[type];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Sound effects (Web Audio API friendly)
export function playSound(type: 'correct' | 'incorrect' | 'levelup' | 'achievement' | 'click') {
  // This would integrate with Web Audio API in a full implementation
  if (typeof window !== 'undefined' && window.AudioContext) {
    const frequencies: Record<typeof type, number[]> = {
      correct: [523.25, 659.25, 783.99], // C5, E5, G5
      incorrect: [311.13, 293.66], // Eb4, D4
      levelup: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
      achievement: [783.99, 987.77, 1174.66], // G5, B5, D6
      click: [440], // A4
    };
    
    const audioContext = new AudioContext();
    const freqs = frequencies[type];
    
    freqs.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime + i * 0.1);
      oscillator.stop(audioContext.currentTime + 0.3 + i * 0.1);
    });
  }
}
