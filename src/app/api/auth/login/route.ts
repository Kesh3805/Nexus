import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { z } from 'zod';
import { handleApiError, apiErrors } from '@/lib/api-errors';
import { checkRateLimit, getIdentifier, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    // Rate limit check for auth endpoints
    const identifier = getIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.auth);
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${retryAfter} seconds.` },
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
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues?.[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }
    
    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw apiErrors.invalidCredentials();
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw apiErrors.invalidCredentials();
    }

    // Check streak
    const now = new Date();
    const lastActive = new Date(user.lastActiveAt);
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    let newStreak = user.streak;
    if (hoursSinceActive > 48) {
      // Lost streak
      newStreak = 0;
    } else if (hoursSinceActive > 24) {
      // New day, maintain or continue streak
      newStreak = user.streak; // Will be incremented on first quiz
    }

    // Update last active
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastActiveAt: now,
        streak: newStreak,
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
    const token = signToken(updatedUser.id);

    return NextResponse.json({ user: updatedUser, token });
  } catch (error) {
    return handleApiError(error);
  }
}
