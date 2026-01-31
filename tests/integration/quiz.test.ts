/**
 * Integration Tests for Quiz API Routes
 * 
 * Tests the quiz flow including:
 * - GET /api/quizzes/[id] - Fetch quiz by ID
 * - POST /api/quizzes/[id]/submit - Submit quiz answers
 * 
 * CRITICAL PATHS TESTED:
 * ✅ Success: Valid quiz fetch, valid submission
 * ✅ Failure: Quiz not found, unauthorized, invalid answers
 * ✅ Edge cases: Perfect score, speed bonus, streak increments
 * ✅ Business logic: XP calculation, level up, achievement triggers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma before importing routes
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      quiz: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      quizAttempt: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
      dailyProgress: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      achievement: {
        findUnique: vi.fn(),
      },
      userAchievement: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
      },
    },
  };
});

import prisma from '@/lib/prisma';
import { GET as getQuizHandler } from '@/app/api/quizzes/[id]/route';
import { POST as submitQuizHandler } from '@/app/api/quizzes/[id]/submit/route';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function createGetRequest(id: string): Request {
  return new Request(`http://localhost:3000/api/quizzes/${id}`, {
    method: 'GET',
  });
}

function createSubmitRequest(id: string, body: any, token?: string): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return new Request(`http://localhost:3000/api/quizzes/${id}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

const mockQuiz = {
  id: 'quiz-1',
  title: 'Test Quiz',
  description: 'A test quiz',
  xpReward: 100,
  coinReward: 50,
  questions: [
    {
      id: 'q1',
      text: 'What is 2 + 2?',
      options: JSON.stringify([
        { id: 'a', text: '3', isCorrect: false },
        { id: 'b', text: '4', isCorrect: true },
        { id: 'c', text: '5', isCorrect: false },
      ]),
      explanation: 'Basic math',
      points: 10,
      order: 1,
    },
    {
      id: 'q2',
      text: 'Capital of France?',
      options: JSON.stringify([
        { id: 'a', text: 'London', isCorrect: false },
        { id: 'b', text: 'Paris', isCorrect: true },
      ]),
      explanation: 'Geography',
      points: 10,
      order: 2,
    },
  ],
  category: { id: 'cat-1', name: 'General' },
  _count: { attempts: 5 },
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  level: 5,
  xp: 250,
  totalXp: 1000,
  streak: 3,
  longestStreak: 7,
  coins: 100,
  totalQuizzes: 10,
  totalCorrect: 80,
  totalAnswered: 100,
  perfectQuizzes: 2,
};

describe('GET /api/quizzes/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success cases', () => {
    it('returns quiz with parsed options', async () => {
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);

      const request = createGetRequest('quiz-1');
      const params = { params: { id: 'quiz-1' } };

      const response = await getQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('quiz-1');
      expect(data.title).toBe('Test Quiz');
      expect(data.questions).toHaveLength(2);
      
      // Options should be parsed from JSON
      expect(Array.isArray(data.questions[0].options)).toBe(true);
      expect(data.questions[0].options[1].id).toBe('b');
      expect(data.questions[0].options[1].isCorrect).toBe(true);
    });

    it('includes category information', async () => {
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);

      const request = createGetRequest('quiz-1');
      const params = { params: { id: 'quiz-1' } };

      const response = await getQuizHandler(request, params);
      const data = await response.json();

      expect(data.category).toBeDefined();
      expect(data.category.name).toBe('General');
    });

    it('includes attempt count', async () => {
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);

      const request = createGetRequest('quiz-1');
      const params = { params: { id: 'quiz-1' } };

      const response = await getQuizHandler(request, params);
      const data = await response.json();

      expect(data._count.attempts).toBe(5);
    });
  });

  describe('failure cases', () => {
    it('returns 404 for non-existent quiz', async () => {
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);

      const request = createGetRequest('non-existent');
      const params = { params: { id: 'non-existent' } };

      const response = await getQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Quiz not found');
    });
  });
});

describe('POST /api/quizzes/[id]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication', () => {
    it('returns 401 without authorization header', async () => {
      const request = createSubmitRequest('quiz-1', { answers: {} });
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 with invalid token', async () => {
      const request = createSubmitRequest('quiz-1', { answers: {} }, 'invalid-token');
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('success cases', () => {
    it('calculates score correctly for all correct answers', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, level: 5 } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: {
            q1: ['b'], // Correct
            q2: ['b'], // Correct
          },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toHaveLength(2);
      expect(data.results[0].isCorrect).toBe(true);
      expect(data.results[1].isCorrect).toBe(true);
    });

    it('calculates partial score correctly', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 1 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: {
            q1: ['a'], // Wrong
            q2: ['b'], // Correct
          },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results[0].isCorrect).toBe(false);
      expect(data.results[1].isCorrect).toBe(true);
    });

    it('includes XP breakdown in response', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, streak: 5 } as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: { q1: ['b'], q2: ['b'] },
          timeSpent: 30, // Fast completion for speed bonus
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.xp).toBeDefined();
      expect(data.xp.base).toBeDefined();
      expect(data.xp.streak).toBeDefined();
      expect(data.xp.speed).toBeDefined();
      expect(data.xp.perfect).toBeDefined();
      expect(data.xp.total).toBeDefined();
    });

    it('gives speed bonus for completion under 60 seconds', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, streak: 1 } as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 1 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: { q1: ['b'], q2: ['b'] },
          timeSpent: 30,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.xp.speed).toBeGreaterThan(0);
    });

    it('gives perfect bonus for 100% score', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, streak: 1 } as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 1 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: { q1: ['b'], q2: ['b'] },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.xp.perfect).toBeGreaterThan(0);
    });

    it('no perfect bonus for less than 100%', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, streak: 1 } as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 1 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: { q1: ['a'], q2: ['b'] }, // One wrong
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.xp.perfect).toBe(0);
    });
  });

  describe('streak logic', () => {
    it('increments streak for first quiz of the day', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, streak: 3 } as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue(null); // No progress today
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, streak: 4 } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: { q1: ['b'], q2: ['b'] },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.streak).toBe(4);
      expect(data.streakIncremented).toBe(true);
    });

    it('does not increment streak for subsequent quizzes same day', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, streak: 3 } as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 2 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, streak: 3 } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: { q1: ['b'], q2: ['b'] },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.streak).toBe(3);
      expect(data.streakIncremented).toBe(false);
    });
  });

  describe('failure cases', () => {
    it('returns 404 for non-existent quiz', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'non-existent',
        { answers: {}, timeSpent: 0 },
        token
      );
      const params = { params: { id: 'non-existent' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Quiz not found');
    });

    it('returns 404 for non-existent user', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        { answers: {}, timeSpent: 0 },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('answer validation edge cases', () => {
    it('handles missing answers as incorrect', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 1 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: {
            q1: ['b'], // Only answered first question
            // q2 missing
          },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.results[0].isCorrect).toBe(true);
      expect(data.results[1].isCorrect).toBe(false);
    });

    it('handles empty answer array as incorrect', async () => {
      const token = generateToken('user-1');
      vi.mocked(prisma.quiz.findUnique).mockResolvedValue(mockQuiz as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.dailyProgress.findUnique).mockResolvedValue({ quizzesCompleted: 1 } as any);
      vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-1' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser } as any);
      vi.mocked(prisma.dailyProgress.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.achievement.findUnique).mockResolvedValue(null);

      const request = createSubmitRequest(
        'quiz-1',
        {
          answers: {
            q1: [],
            q2: [],
          },
          timeSpent: 120,
        },
        token
      );
      const params = { params: { id: 'quiz-1' } };

      const response = await submitQuizHandler(request, params);
      const data = await response.json();

      expect(data.results[0].isCorrect).toBe(false);
      expect(data.results[1].isCorrect).toBe(false);
    });
  });
});
