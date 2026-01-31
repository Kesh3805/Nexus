import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit, getIdentifier, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-errors';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().max(50, 'Display name too long').optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limit check for registration
    const identifier = getIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.auth);
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${retryAfter} seconds.` },
        { 
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    // Validate input with Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues?.[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }
    
    const { email, username, password, displayName } = result.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || username,
        avatarSeed: Math.random().toString(36).slice(2),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarStyle: true,
        avatarSeed: true,
        level: true,
        xp: true,
        totalXp: true,
        streak: true,
        longestStreak: true,
        gems: true,
        coins: true,
        totalQuizzes: true,
        totalCorrect: true,
        totalAnswered: true,
        perfectQuizzes: true,
      },
    });

    // Generate JWT using centralized auth
    const token = signToken(user.id);

    // Give first achievement
    const firstAchievement = await prisma.achievement.findFirst({
      where: { name: 'First Steps' },
    });

    if (firstAchievement) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to Nexus Quiz!',
          message: 'Your journey begins now. Complete your first quiz to earn achievements!',
        },
      });
    }

    return NextResponse.json({ user, token });
  } catch (error) {
    return handleApiError(error);
  }
}
