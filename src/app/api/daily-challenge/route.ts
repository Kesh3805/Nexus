'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { handleApiError, apiErrors } from '@/lib/api-errors';

// Generate daily challenge based on date
function getDailySeed(date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    const today = new Date();
    const seed = getDailySeed(today);

    // Get all quizzes and select one based on daily seed
    const quizzes = await prisma.quiz.findMany({
      include: {
        category: true,
        questions: true,
      },
    });

    if (quizzes.length === 0) {
      throw apiErrors.notFound('Daily challenge quizzes');
    }

    const dailyQuiz = quizzes[seed % quizzes.length];

    // Check if user has completed today's challenge
    let hasCompleted = false;
    let todayScore = null;

    if (userId) {
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const attempt = await prisma.quizAttempt.findFirst({
        where: {
          userId,
          quizId: dailyQuiz.id,
          startedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        orderBy: { score: 'desc' },
      });

      if (attempt) {
        hasCompleted = true;
        todayScore = attempt.score;
      }
    }

    // Get today's leaderboard
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const topScores = await prisma.quizAttempt.findMany({
      where: {
        quizId: dailyQuiz.id,
        startedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarStyle: true,
            level: true,
          },
        },
      },
      orderBy: [{ score: 'desc' }, { timeSpent: 'asc' }],
      take: 10,
    });

    // Calculate time remaining
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeRemaining = tomorrow.getTime() - Date.now();

    return NextResponse.json({
      challenge: {
        id: dailyQuiz.id,
        title: dailyQuiz.title,
        description: dailyQuiz.description,
        category: dailyQuiz.category,
        difficulty: dailyQuiz.difficulty,
        questionCount: dailyQuiz.questions.length,
        timeLimit: dailyQuiz.timeLimit,
        xpReward: dailyQuiz.xpReward * 2, // Double XP for daily challenge
        coinReward: dailyQuiz.coinReward * 2,
        bonusGems: 10,
      },
      hasCompleted,
      todayScore,
      leaderboard: topScores.map((score, index) => ({
        rank: index + 1,
        user: score.user,
        score: score.score,
        timeSpent: score.timeSpent,
      })),
      timeRemaining,
      participantCount: topScores.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
