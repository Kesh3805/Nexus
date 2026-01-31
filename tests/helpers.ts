/**
 * Test Utilities and Helpers
 * 
 * Provides mock implementations and helper functions for testing
 * API routes and components.
 */

import { vi } from 'vitest';
import jwt from 'jsonwebtoken';

// Test constants
export const JWT_SECRET = 'test-secret';
export const TEST_USER_ID = 'test-user-123';

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(userId: string = TEST_USER_ID): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Create a mock Request object for API route testing
 */
export function createMockRequest(
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    url?: string;
    searchParams?: Record<string, string>;
  } = {}
): Request {
  const {
    method = 'GET',
    body,
    headers = {},
    url = 'http://localhost:3000/api/test',
    searchParams = {},
  } = options;

  const fullUrl = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    fullUrl.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(fullUrl.toString(), requestInit);
}

/**
 * Create authenticated request with Bearer token
 */
export function createAuthenticatedRequest(
  options: Parameters<typeof createMockRequest>[0] = {},
  userId: string = TEST_USER_ID
): Request {
  const token = generateTestToken(userId);
  return createMockRequest({
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Mock Prisma client for testing
 * Use this to mock database operations in unit tests
 */
export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    quiz: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    quizAttempt: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      groupBy: vi.fn(),
    },
    answer: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
    },
    achievement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userAchievement: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    dailyProgress: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      groupBy: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    friendship: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    shopItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userItem: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  };
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: TEST_USER_ID,
  email: 'test@example.com',
  username: 'testuser',
  password: '$2a$12$hashedpassword', // bcrypt hash
  displayName: 'Test User',
  avatarStyle: 'adventurer',
  avatarSeed: 'test-seed',
  level: 5,
  xp: 250,
  totalXp: 1000,
  streak: 3,
  longestStreak: 7,
  gems: 100,
  coins: 500,
  totalQuizzes: 10,
  totalCorrect: 80,
  totalAnswered: 100,
  perfectQuizzes: 2,
  lastActiveAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock quiz data for testing
 */
export const mockQuiz = {
  id: 'quiz-123',
  title: 'Test Quiz',
  description: 'A test quiz',
  slug: 'test-quiz',
  categoryId: 'category-1',
  difficulty: 'MEDIUM',
  timeLimit: 300,
  xpReward: 100,
  coinReward: 50,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [
    {
      id: 'q1',
      quizId: 'quiz-123',
      type: 'SINGLE',
      text: 'What is 2 + 2?',
      options: JSON.stringify([
        { id: 'a', text: '3', isCorrect: false },
        { id: 'b', text: '4', isCorrect: true },
        { id: 'c', text: '5', isCorrect: false },
      ]),
      explanation: 'Basic arithmetic',
      points: 10,
      order: 1,
    },
    {
      id: 'q2',
      quizId: 'quiz-123',
      type: 'SINGLE',
      text: 'What is the capital of France?',
      options: JSON.stringify([
        { id: 'a', text: 'London', isCorrect: false },
        { id: 'b', text: 'Paris', isCorrect: true },
        { id: 'c', text: 'Berlin', isCorrect: false },
      ]),
      explanation: 'Geography knowledge',
      points: 10,
      order: 2,
    },
  ],
  category: {
    id: 'category-1',
    name: 'General Knowledge',
    slug: 'general-knowledge',
    description: 'General knowledge questions',
    icon: '📚',
    color: '#4CAF50',
  },
  _count: {
    attempts: 5,
  },
};

/**
 * Mock achievement data
 */
export const mockAchievements = [
  {
    id: 'ach-1',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    xpReward: 50,
    rarity: 'COMMON',
  },
  {
    id: 'ach-2',
    name: 'Perfectionist',
    description: 'Get 100% on a quiz',
    icon: '⭐',
    xpReward: 100,
    rarity: 'RARE',
  },
  {
    id: 'ach-3',
    name: 'On Fire',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 200,
    rarity: 'EPIC',
  },
];

/**
 * Assert that a Response is valid JSON with expected status
 */
export async function assertJsonResponse(
  response: Response,
  expectedStatus: number = 200
): Promise<any> {
  expect(response.status).toBe(expectedStatus);
  expect(response.headers.get('content-type')).toContain('application/json');
  return response.json();
}

/**
 * Assert error response structure
 */
export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
): Promise<void> {
  expect(response.status).toBe(expectedStatus);
  const data = await response.json();
  expect(data.error).toBeDefined();
  if (expectedMessage) {
    expect(data.error).toBe(expectedMessage);
  }
}
