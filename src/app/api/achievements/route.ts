import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      requirement: JSON.parse(a.requirement as string),
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
    console.error('Achievements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
