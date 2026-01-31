import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)));
    const offset = (page - 1) * limit;

    // Get date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get top users by XP earned in period
    const leaderboard = await prisma.dailyProgress.groupBy({
      by: ['userId'],
      _sum: {
        xpEarned: true,
        quizzesCompleted: true,
        correctAnswers: true,
      },
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        _sum: {
          xpEarned: 'desc',
        },
      },
      skip: offset,
      take: limit,
    });

    // Get user details
    const userIds = leaderboard.map((l) => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarStyle: true,
        avatarSeed: true,
        level: true,
        streak: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const rankings = leaderboard.map((entry, index) => {
      const user = userMap.get(entry.userId);
      return {
        rank: offset + index + 1,
        userId: entry.userId,
        username: user?.username || 'Unknown',
        displayName: user?.displayName,
        avatarStyle: user?.avatarStyle || 'adventurer',
        avatarSeed: user?.avatarSeed || entry.userId,
        level: user?.level || 1,
        streak: user?.streak || 0,
        xpEarned: entry._sum.xpEarned || 0,
        quizzesCompleted: entry._sum.quizzesCompleted || 0,
        correctAnswers: entry._sum.correctAnswers || 0,
      };
    });

    // Get current user's rank if authenticated
    const userId = getUserIdFromRequest(request);
    let currentUserRank = null;

    if (userId) {
      const userIndex = rankings.findIndex((r) => r.userId === userId);
      if (userIndex !== -1) {
        currentUserRank = rankings[userIndex];
      } else {
        // User not in top 50, calculate their rank
        const userProgress = await prisma.dailyProgress.aggregate({
          _sum: {
            xpEarned: true,
          },
          where: {
            userId,
            date: { gte: startDate },
          },
        });

        if (userProgress._sum.xpEarned) {
          const higherCount = await prisma.dailyProgress.groupBy({
            by: ['userId'],
            _sum: { xpEarned: true },
            where: { date: { gte: startDate } },
            having: {
              xpEarned: { _sum: { gt: userProgress._sum.xpEarned } },
            },
          });

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              username: true,
              displayName: true,
              avatarStyle: true,
              avatarSeed: true,
              level: true,
              streak: true,
            },
          });

          currentUserRank = {
            rank: higherCount.length + 1,
            userId,
            username: user?.username || 'Unknown',
            displayName: user?.displayName,
            avatarStyle: user?.avatarStyle || 'adventurer',
            avatarSeed: user?.avatarSeed || userId,
            level: user?.level || 1,
            streak: user?.streak || 0,
            xpEarned: userProgress._sum.xpEarned,
          };
        }
      }
    }

    const response = NextResponse.json({
      rankings,
      currentUserRank,
      period,
      pagination: {
        page,
        limit,
        hasMore: leaderboard.length === limit,
      },
    });
    
    // Cache for 1 minute (leaderboard updates frequently but can be slightly stale)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
