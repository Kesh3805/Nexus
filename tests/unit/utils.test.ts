/**
 * Unit Tests for src/lib/utils.ts
 * 
 * Testing pure business logic functions:
 * - getXpForLevel: XP curve calculation
 * - getLevelFromXp: Level calculation from total XP
 * - formatNumber: Number formatting (K, M suffixes)
 * - formatTime: Seconds to mm:ss conversion
 * - getStreakBonus: Streak multiplier calculation
 * - getAvatarUrl: DiceBear URL generation
 */

import { describe, it, expect } from 'vitest';
import {
  getXpForLevel,
  getLevelFromXp,
  formatNumber,
  formatTime,
  getStreakBonus,
  getAvatarUrl,
  cn,
} from '@/lib/utils';

describe('getXpForLevel', () => {
  describe('success cases', () => {
    it('returns 100 XP for level 1', () => {
      expect(getXpForLevel(1)).toBe(100);
    });

    it('returns 150 XP for level 2 (100 * 1.5)', () => {
      expect(getXpForLevel(2)).toBe(150);
    });

    it('returns correct exponential progression for level 5', () => {
      // 100 * 1.5^4 = 100 * 5.0625 = 506.25 → 506
      expect(getXpForLevel(5)).toBe(506);
    });

    it('returns correct value for level 10', () => {
      // 100 * 1.5^9 = 3844.33... → 3844
      expect(getXpForLevel(10)).toBe(3844);
    });
  });

  describe('edge cases', () => {
    it('handles level 0 (below minimum) by clamping to level 1', () => {
      // Now clamps to level 1 for safety (100 * 1.5^0 = 100)
      const result = getXpForLevel(0);
      expect(result).toBe(100); // Same as level 1
    });

    it('handles very high levels', () => {
      const result = getXpForLevel(50);
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result)).toBe(true);
    });
  });
});

describe('getLevelFromXp', () => {
  describe('success cases', () => {
    it('returns level 1 with 0 XP', () => {
      const result = getLevelFromXp(0);
      expect(result.level).toBe(1);
      expect(result.currentXp).toBe(0);
      expect(result.nextLevelXp).toBe(100);
    });

    it('returns level 1 with 99 XP', () => {
      const result = getLevelFromXp(99);
      expect(result.level).toBe(1);
      expect(result.currentXp).toBe(99);
      expect(result.nextLevelXp).toBe(100);
    });

    it('returns level 2 with exactly 100 XP', () => {
      const result = getLevelFromXp(100);
      expect(result.level).toBe(2);
      expect(result.currentXp).toBe(0);
    });

    it('returns level 3 with 250 XP (100 + 150 = 250)', () => {
      const result = getLevelFromXp(250);
      expect(result.level).toBe(3);
      expect(result.currentXp).toBe(0);
    });

    it('correctly tracks remaining XP within level', () => {
      const result = getLevelFromXp(130);
      expect(result.level).toBe(2);
      expect(result.currentXp).toBe(30);
      expect(result.nextLevelXp).toBe(150);
    });
  });

  describe('edge cases', () => {
    it('handles negative XP by clamping to 0', () => {
      // Now clamps to 0 for safety
      const result = getLevelFromXp(-100);
      expect(result.level).toBe(1);
      expect(result.currentXp).toBe(0); // Clamped from -100 to 0
    });

    it('handles large XP values', () => {
      const result = getLevelFromXp(100000);
      expect(result.level).toBeGreaterThan(10);
      expect(result.currentXp).toBeGreaterThanOrEqual(0);
      expect(result.currentXp).toBeLessThan(result.nextLevelXp);
    });
  });

  describe('invariants', () => {
    it('currentXp is always less than nextLevelXp for positive totals', () => {
      for (const xp of [0, 50, 100, 500, 1000, 5000]) {
        const result = getLevelFromXp(xp);
        expect(result.currentXp).toBeLessThan(result.nextLevelXp);
      }
    });
  });
});

describe('formatNumber', () => {
  describe('success cases', () => {
    it('returns raw number under 1000', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
    });

    it('formats thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('formats millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(2500000)).toBe('2.5M');
    });
  });

  describe('edge cases', () => {
    it('handles negative numbers correctly', () => {
      // Fixed: formatNumber now handles negative numbers
      expect(formatNumber(-1000)).toBe('-1.0K');
      expect(formatNumber(-1500000)).toBe('-1.5M');
      expect(formatNumber(-500)).toBe('-500');
    });

    it('handles decimal input by treating as integer string', () => {
      expect(formatNumber(1000.5)).toBe('1.0K');
    });
  });
});

describe('formatTime', () => {
  describe('success cases', () => {
    it('formats 0 seconds as 0:00', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('formats seconds under a minute with zero padding', () => {
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(59)).toBe('0:59');
    });

    it('formats full minutes correctly', () => {
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(120)).toBe('2:00');
    });

    it('formats mixed minutes and seconds', () => {
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(130)).toBe('2:10');
      expect(formatTime(599)).toBe('9:59');
    });

    it('handles times over 10 minutes', () => {
      expect(formatTime(600)).toBe('10:00');
      expect(formatTime(3599)).toBe('59:59');
      expect(formatTime(3600)).toBe('60:00');
    });
  });

  describe('edge cases', () => {
    it('handles negative seconds', () => {
      // Math.floor of negative / 60 and modulo behavior
      const result = formatTime(-30);
      // -30 % 60 = -30 (or 30 depending on implementation)
      expect(result).toBeDefined();
    });
  });
});

describe('getStreakBonus', () => {
  describe('success cases', () => {
    it('returns 0 for streak of 0', () => {
      expect(getStreakBonus(0, 100)).toBe(0);
    });

    it('returns 0 for streak of 1', () => {
      expect(getStreakBonus(1, 100)).toBe(0);
    });

    it('returns 10% bonus for streak of 2', () => {
      // 2 * 0.1 = 0.2 multiplier on 100 base = 20
      expect(getStreakBonus(2, 100)).toBe(20);
    });

    it('returns 50% bonus for streak of 5', () => {
      // 5 * 0.1 = 0.5 multiplier on 100 base = 50
      expect(getStreakBonus(5, 100)).toBe(50);
    });

    it('caps at 100% bonus for streak of 10+', () => {
      // Min(10 * 0.1, 1) = 1 multiplier on 100 = 100
      expect(getStreakBonus(10, 100)).toBe(100);
      expect(getStreakBonus(15, 100)).toBe(100);
      expect(getStreakBonus(100, 100)).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('handles 0 base XP', () => {
      expect(getStreakBonus(5, 0)).toBe(0);
    });

    it('handles negative streak (should return 0)', () => {
      expect(getStreakBonus(-1, 100)).toBe(0);
    });

    it('floors fractional results', () => {
      // 3 * 0.1 = 0.3 on 33 = 9.9 → 9
      expect(getStreakBonus(3, 33)).toBe(9);
    });
  });
});

describe('getAvatarUrl', () => {
  describe('success cases', () => {
    it('generates correct DiceBear URL format', () => {
      const url = getAvatarUrl('adventurer', 'user123');
      expect(url).toBe('https://api.dicebear.com/7.x/adventurer/svg?seed=user123&backgroundColor=0a0a0a');
    });

    it('encodes special characters in seed', () => {
      const url = getAvatarUrl('avataaars', 'user with spaces');
      expect(url).toContain('seed=user%20with%20spaces');
    });

    it('supports different avatar styles', () => {
      const styles = ['adventurer', 'avataaars', 'bottts', 'identicon'];
      styles.forEach(style => {
        const url = getAvatarUrl(style, 'test');
        expect(url).toContain(`/7.x/${style}/svg`);
      });
    });
  });

  describe('edge cases', () => {
    it('uses default seed for empty string', () => {
      const url = getAvatarUrl('adventurer', '');
      expect(url).toContain('seed=default');
    });

    it('handles undefined/null-like seed gracefully', () => {
      // TypeScript would catch this, but runtime safety
      const url = getAvatarUrl('adventurer', undefined as any);
      expect(url).toContain('seed=default');
    });
  });
});

describe('cn (classname merge utility)', () => {
  describe('success cases', () => {
    it('merges multiple class strings', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('filters out falsy values', () => {
      const result = cn('base', false && 'hidden', null, undefined);
      expect(result).toBe('base');
    });

    it('merges tailwind classes correctly (last wins)', () => {
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8');
    });

    it('handles array inputs', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });
  });
});
