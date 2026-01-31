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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get daily progress
    const dailyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get quiz attempts for detailed stats
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: { gte: startDate },
      },
      include: {
        quiz: {
          include: { category: true },
        },
      },
    });

    // Calculate analytics
    const totalQuizzes = attempts.length;
    const totalXp = dailyProgress.reduce((sum, d) => sum + d.xpEarned, 0);
    const totalCorrect = dailyProgress.reduce((sum, d) => sum + d.correctAnswers, 0);
    const totalQuestions = dailyProgress.reduce((sum, d) => sum + d.questionsAnswered, 0);
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // Category breakdown
    const categoryStats = attempts.reduce((acc: any, attempt) => {
      const cat = attempt.quiz.category.name;
      if (!acc[cat]) {
        acc[cat] = {
          name: cat,
          color: attempt.quiz.category.color,
          quizzes: 0,
          correct: 0,
          total: 0,
        };
      }
      acc[cat].quizzes++;
      acc[cat].correct += attempt.correctCount;
      acc[cat].total += attempt.correctCount + attempt.incorrectCount;
      return acc;
    }, {});

    // Daily chart data
    const chartData = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const progress = dailyProgress.find(
        (p) => p.date.toISOString().split('T')[0] === dateStr
      );

      chartData.push({
        date: dateStr,
        xp: progress?.xpEarned || 0,
        quizzes: progress?.quizzesCompleted || 0,
        accuracy: progress?.questionsAnswered
          ? (progress.correctAnswers / progress.questionsAnswered) * 100
          : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Best and worst categories
    const categoryArray = Object.values(categoryStats) as any[];
    categoryArray.sort((a, b) => {
      const accA = a.total > 0 ? a.correct / a.total : 0;
      const accB = b.total > 0 ? b.correct / b.total : 0;
      return accB - accA;
    });

    return NextResponse.json({
      summary: {
        totalQuizzes,
        totalXp,
        accuracy: accuracy.toFixed(1),
        totalTime: dailyProgress.reduce((sum, d) => sum + d.timeSpent, 0),
        perfectQuizzes: attempts.filter((a) => a.isPerfect).length,
        avgScore:
          attempts.length > 0
            ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length).toFixed(1)
            : 0,
      },
      chartData,
      categoryStats: categoryArray,
      bestCategory: categoryArray[0] || null,
      worstCategory: categoryArray[categoryArray.length - 1] || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
