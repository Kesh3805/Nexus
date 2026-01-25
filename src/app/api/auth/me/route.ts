import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId: decoded.userId },
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
          userId: decoded.userId,
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
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, displayName, bio, avatarStyle } = body;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        displayName: displayName || name,
        bio,
        avatarStyle,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarStyle: true,
        bio: true,
        level: true,
        xp: true,
        totalXp: true,
        streak: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
