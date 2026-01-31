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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarStyle: true,
        avatarSeed: true,
        bio: true,
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
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            quizAttempts: true,
            achievements: true,
            friendsAsUser1: true,
            friendsAsUser2: true,
          },
        },
      },
    });

    if (!user) {
      throw apiErrors.notFound('User');
    }

    // Get recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId: userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
      take: 5,
    });

    // Get rank on leaderboard
    const usersAbove = await prisma.user.count({
      where: { totalXp: { gt: user.totalXp } },
    });
    const rank = usersAbove + 1;

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today,
        },
      },
    });

    // Calculate daily goal progress
    const dailyGoal = 3; // quizzes per day
    const dailyProgress = todayProgress?.quizzesCompleted || 0;

    return NextResponse.json({ 
      user: {
        ...user,
        friendCount: user._count.friendsAsUser1 + user._count.friendsAsUser2,
        achievementCount: user._count.achievements,
      },
      rank,
      recentAchievements: recentAchievements.map(ua => ua.achievement),
      dailyGoal: {
        target: dailyGoal,
        completed: dailyProgress,
        percentage: Math.min(100, (dailyProgress / dailyGoal) * 100),
      },
      todayStats: todayProgress || {
        quizzesCompleted: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        xpEarned: 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, displayName, bio, avatarStyle, avatarSeed } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName || name,
        bio,
        avatarStyle,
        avatarSeed: avatarSeed || undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarStyle: true,
        avatarSeed: true,
        bio: true,
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

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    // Delete user - cascading deletes will handle related records
    // Most relations have onDelete: Cascade in schema
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
