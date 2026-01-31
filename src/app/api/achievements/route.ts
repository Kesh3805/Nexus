import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { handleApiError, apiErrors } from '@/lib/api-errors';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    // Get all achievements with user's unlock status
    const achievements = await prisma.achievement.findMany({
      include: {
        users: {
          where: { userId },
        },
      },
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' },
      ],
    });

    const achievementList = achievements.map((a) => ({
      ...a,
      isUnlocked: a.users.length > 0,
      unlockedAt: a.users[0]?.unlockedAt || null,
      requirement: typeof a.requirement === 'string' 
        ? JSON.parse(a.requirement) 
        : a.requirement,
    }));

    // Separate by unlock status
    const unlocked = achievementList.filter((a) => a.isUnlocked);
    const locked = achievementList.filter((a) => !a.isUnlocked && !a.isSecret);
    const secret = achievementList.filter((a) => !a.isUnlocked && a.isSecret);

    return NextResponse.json({
      unlocked,
      locked,
      secret: secret.length, // Just return count for secret achievements
      total: achievements.length,
      unlockedCount: unlocked.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
