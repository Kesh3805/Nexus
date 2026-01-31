/**
 * Integration Tests for Categories & Achievements API Routes
 * 
 * Tests include:
 * - GET /api/categories - List all categories
 * - GET /api/achievements - Get user achievements
 * 
 * CRITICAL PATHS TESTED:
 * ✅ Success: Valid fetch with auth
 * ✅ Failure: Unauthorized access
 * ✅ Edge cases: Empty data, hidden achievements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma before importing routes
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      category: {
        findMany: vi.fn(),
      },
      achievement: {
        findMany: vi.fn(),
      },
    },
  };
});

import prisma from '@/lib/prisma';
import { GET as getCategoriesHandler } from '@/app/api/categories/route';
import { GET as getAchievementsHandler } from '@/app/api/achievements/route';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

function createAuthenticatedRequest(url: string, token?: string): Request {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return new Request(url, { method: 'GET', headers });
}

describe('GET /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success cases', () => {
    it('returns all categories with quiz counts', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'AdTech Basics',
          slug: 'adtech-basics',
          description: 'Fundamentals of advertising technology',
          icon: '📊',
          color: '#4CAF50',
          order: 1,
          _count: { quizzes: 5 },
        },
        {
          id: 'cat-2',
          name: 'Programmatic',
          slug: 'programmatic',
          description: 'Real-time bidding and programmatic buying',
          icon: '🤖',
          color: '#2196F3',
          order: 2,
          _count: { quizzes: 8 },
        },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const request = new Request('http://localhost:3000/api/categories');
      const response = await getCategoriesHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('AdTech Basics');
      expect(data[0]._count.quizzes).toBe(5);
      expect(data[1].name).toBe('Programmatic');
    });

    it('returns empty array when no categories exist', async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([]);

      const response = await getCategoriesHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('categories are ordered by order field', async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([]);

      await getCategoriesHandler();

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { order: 'asc' },
        })
      );
    });
  });
});

describe('GET /api/achievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication', () => {
    it('returns 401 without authorization header', async () => {
      const request = createAuthenticatedRequest('http://localhost:3000/api/achievements');
      const response = await getAchievementsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 with invalid token', async () => {
      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/achievements',
        'invalid-token'
      );
      const response = await getAchievementsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('success cases', () => {
    it('returns achievements with unlock status', async () => {
      const token = generateToken('user-1');
      const mockAchievements = [
        {
          id: 'ach-1',
          name: 'First Steps',
          description: 'Complete your first quiz',
          icon: '🎯',
          category: 'PROGRESS',
          rarity: 'COMMON',
          xpReward: 50,
          isSecret: false,
          requirement: '{}',
          users: [{ userId: 'user-1', unlockedAt: new Date() }],
        },
        {
          id: 'ach-2',
          name: 'Perfectionist',
          description: 'Get 100% on any quiz',
          icon: '⭐',
          category: 'SKILL',
          rarity: 'RARE',
          xpReward: 100,
          isSecret: false,
          requirement: '{}',
          users: [],
        },
        {
          id: 'ach-3',
          name: 'Secret Achievement',
          description: 'Secret',
          icon: '🔒',
          category: 'SECRET',
          rarity: 'LEGENDARY',
          xpReward: 500,
          isSecret: true,
          requirement: '{}',
          users: [],
        },
      ];

      vi.mocked(prisma.achievement.findMany).mockResolvedValue(mockAchievements as any);

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/achievements',
        token
      );
      const response = await getAchievementsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.unlocked).toHaveLength(1);
      expect(data.locked).toHaveLength(1);
      expect(data.secret).toBe(1); // Count only
      expect(data.total).toBe(3);
      expect(data.unlockedCount).toBe(1);
    });

    it('correctly identifies unlocked achievements', async () => {
      const token = generateToken('user-1');
      const mockAchievements = [
        {
          id: 'ach-1',
          name: 'Unlocked One',
          isSecret: false,
          requirement: '{}',
          users: [{ userId: 'user-1', unlockedAt: new Date('2024-01-15') }],
        },
      ];

      vi.mocked(prisma.achievement.findMany).mockResolvedValue(mockAchievements as any);

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/achievements',
        token
      );
      const response = await getAchievementsHandler(request);
      const data = await response.json();

      expect(data.unlocked[0].isUnlocked).toBe(true);
      expect(data.unlocked[0].unlockedAt).toBeDefined();
    });

    it('hides secret achievement details', async () => {
      const token = generateToken('user-1');
      const mockAchievements = [
        {
          id: 'secret-1',
          name: 'Hidden Secret',
          description: 'You should not see this',
          isSecret: true,
          requirement: '{}',
          users: [],
        },
        {
          id: 'secret-2',
          name: 'Another Secret',
          isSecret: true,
          requirement: '{}',
          users: [],
        },
      ];

      vi.mocked(prisma.achievement.findMany).mockResolvedValue(mockAchievements as any);

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/achievements',
        token
      );
      const response = await getAchievementsHandler(request);
      const data = await response.json();

      // Secret achievements return only count, not details
      expect(data.secret).toBe(2);
      expect(data.locked).toHaveLength(0); // Secrets not in locked list
    });
  });
});
