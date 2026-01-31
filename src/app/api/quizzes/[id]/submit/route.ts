import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLevelFromXp, getStreakBonus } from '@/lib/utils';
import { getUserIdFromRequest } from '@/lib/auth';
import { handleApiError, apiErrors } from '@/lib/api-errors';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    const body = await request.json();
    const { answers, timeSpent } = body;

    if (!answers || typeof answers !== 'object') {
      throw apiErrors.invalidInput('Answers are required');
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: true },
    });

    if (!quiz) {
      throw apiErrors.notFound('Quiz');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw apiErrors.notFound('User');
    }

    // CRITICAL SECURITY: Prevent quiz farming exploit
    // Check if user already completed this quiz today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const existingAttemptToday = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId: params.id,
        attemptedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    if (existingAttemptToday) {
      throw apiErrors.alreadyCompleted('This quiz');
    }

    // Validate timeSpent (prevent negative or overflow values)
    const validatedTimeSpent = Math.max(0, Math.min(timeSpent || 0, 3600)); // Max 1 hour

    // Calculate scores
    let correctCount = 0;
    let incorrectCount = 0;
    let score = 0;
    let maxScore = 0;

    const answerResults = quiz.questions.map((question) => {
      const options = JSON.parse(question.options as string);
      const correctOptions = options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
      const userAnswer = answers[question.id] || [];
      
      maxScore += question.points;

      const isCorrect =
        correctOptions.length === userAnswer.length &&
        correctOptions.every((id: string) => userAnswer.includes(id));

      if (isCorrect) {
        correctCount++;
        score += question.points;
      } else {
        incorrectCount++;
      }

      return {
        questionId: question.id,
        selectedOptions: userAnswer,
        isCorrect,
        correctOptions,
        explanation: question.explanation,
      };
    });

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const isPerfect = correctCount === quiz.questions.length;

    // Calculate XP and bonuses
    let baseXp = Math.floor(quiz.xpReward * (percentage / 100));
    const streakBonus = getStreakBonus(user.streak, baseXp);
    const speedBonus = timeSpent < 60 ? Math.floor(baseXp * 0.2) : 0; // 20% bonus for under 60 seconds
    const perfectBonus = isPerfect ? Math.floor(baseXp * 0.5) : 0; // 50% bonus for perfect
    
    const totalXpEarned = baseXp + streakBonus + speedBonus + perfectBonus;
    const coinsEarned = Math.floor(quiz.coinReward * (percentage / 100));

    // Check if streak should be incremented (first quiz of the day)
    // Reuse todayStart from anti-farming check above
    const todayDateOnly = todayStart;
    const yesterday = new Date(todayDateOnly);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayDateOnly,
        },
      },
    });

    const yesterdayProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: yesterday,
        },
      },
    });

    // First quiz of today
    const isFirstQuizToday = !todayProgress || todayProgress.quizzesCompleted === 0;
    
    // Determine new streak
    let newStreak = user.streak;
    if (isFirstQuizToday) {
      // Check if user played yesterday to maintain streak
      if (yesterdayProgress && yesterdayProgress.quizzesCompleted > 0) {
        newStreak = user.streak + 1; // Continue streak
      } else if (user.streak === 0) {
        newStreak = 1; // Start new streak
      } else {
        newStreak = 1; // Streak broken, restart
      }
    }
    // If not first quiz today, keep current streak
    
    const newLongestStreak = Math.max(user.longestStreak, newStreak);

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: quiz.id,
        score,
        maxScore,
        percentage,
        correctCount,
        incorrectCount,
        skippedCount: 0,
        timeSpent: validatedTimeSpent,
        isPerfect,
        xpEarned: totalXpEarned,
        coinsEarned,
        bonusXp: streakBonus + speedBonus + perfectBonus,
        completedAt: new Date(),
        answers: {
          create: answerResults.map((a) => ({
            questionId: a.questionId,
            selectedOptions: JSON.stringify(a.selectedOptions),
            isCorrect: a.isCorrect,
          })),
        },
      },
    });

    // Update user stats
    const newTotalXp = user.totalXp + totalXpEarned;
    const levelInfo = getLevelFromXp(newTotalXp);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: levelInfo.level,
        xp: levelInfo.currentXp,
        totalXp: newTotalXp,
        streak: newStreak,
        longestStreak: newLongestStreak,
        coins: user.coins + coinsEarned,
        totalQuizzes: user.totalQuizzes + 1,
        totalCorrect: user.totalCorrect + correctCount,
        totalAnswered: user.totalAnswered + quiz.questions.length,
        perfectQuizzes: isPerfect ? user.perfectQuizzes + 1 : user.perfectQuizzes,
        lastActiveAt: new Date(),
      },
    });

    // Update daily progress
    await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: todayDateOnly,
        },
      },
      update: {
        quizzesCompleted: { increment: 1 },
        questionsAnswered: { increment: quiz.questions.length },
        correctAnswers: { increment: correctCount },
        xpEarned: { increment: totalXpEarned },
        timeSpent: { increment: Math.floor(timeSpent / 60) },
        streakMaintained: true,
      },
      create: {
        userId,
        date: todayDateOnly,
        quizzesCompleted: 1,
        questionsAnswered: quiz.questions.length,
        correctAnswers: correctCount,
        xpEarned: totalXpEarned,
        timeSpent: Math.floor(timeSpent / 60),
        streakMaintained: true,
      },
    });

    // Check for level up
    const leveledUp = levelInfo.level > user.level;

    // Check for achievements
    const newAchievements = [];

    // First quiz achievement
    if (updatedUser.totalQuizzes === 1) {
      const achievement = await prisma.achievement.findUnique({
        where: { name: 'First Steps' },
      });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId,
            achievementId: achievement.id,
          },
        });
        newAchievements.push(achievement);
      }
    }

    // Perfect quiz achievement
    if (isPerfect) {
      const achievement = await prisma.achievement.findUnique({
        where: { name: 'Perfectionist' },
      });
      if (achievement) {
        const existing = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
        });
        if (!existing) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });
          newAchievements.push(achievement);
        }
      }
    }

    // Streak achievements
    if (newStreak === 7) {
      const achievement = await prisma.achievement.findUnique({
        where: { name: 'On Fire' },
      });
      if (achievement) {
        const existing = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
        });
        if (!existing) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });
          newAchievements.push(achievement);
        }
      }
    }

    return NextResponse.json({
      attempt,
      results: answerResults,
      xp: {
        base: baseXp,
        streak: streakBonus,
        speed: speedBonus,
        perfect: perfectBonus,
        total: totalXpEarned,
      },
      coins: coinsEarned,
      leveledUp,
      newLevel: levelInfo.level,
      streak: newStreak,
      streakIncremented: isFirstQuizToday && newStreak > user.streak,
      achievements: newAchievements,
      user: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
