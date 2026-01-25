import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getLevelFromXp, getStreakBonus } from '@/lib/utils';

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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers, timeSpent } = await request.json();

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const shouldIncrementStreak = !todayProgress || todayProgress.quizzesCompleted === 0;
    const newStreak = shouldIncrementStreak ? user.streak + 1 : user.streak;
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
        timeSpent,
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
          date: today,
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
        date: today,
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
      streakIncremented: shouldIncrementStreak,
      achievements: newAchievements,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
