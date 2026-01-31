import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { handleApiError, apiErrors } from '@/lib/api-errors';

// Power-up types and their effects
const POWER_UPS = {
  DOUBLE_XP: {
    id: 'double_xp',
    name: 'Double XP',
    description: 'Earn 2x XP from this quiz',
    icon: '⚡',
    effect: { type: 'xp_multiplier', value: 2 },
    gemCost: 25,
    coinCost: null,
  },
  TIME_FREEZE: {
    id: 'time_freeze',
    name: 'Time Freeze',
    description: 'Pause timer for 30 seconds',
    icon: '❄️',
    effect: { type: 'time_freeze', value: 30 },
    gemCost: 15,
    coinCost: 150,
  },
  FIFTY_FIFTY: {
    id: 'fifty_fifty',
    name: '50/50',
    description: 'Eliminate 2 wrong answers',
    icon: '✂️',
    effect: { type: 'eliminate', value: 2 },
    gemCost: null,
    coinCost: 100,
  },
  SECOND_CHANCE: {
    id: 'second_chance',
    name: 'Second Chance',
    description: 'Get one wrong answer forgiven',
    icon: '💫',
    effect: { type: 'retry', value: 1 },
    gemCost: 30,
    coinCost: null,
  },
  HINT: {
    id: 'hint',
    name: 'Hint',
    description: 'Get a helpful hint for the question',
    icon: '💡',
    effect: { type: 'hint', value: 1 },
    gemCost: null,
    coinCost: 50,
  },
  SKIP: {
    id: 'skip',
    name: 'Skip Question',
    description: 'Skip a difficult question without penalty',
    icon: '⏭️',
    effect: { type: 'skip', value: 1 },
    gemCost: 20,
    coinCost: 200,
  },
};

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    // Return all available power-ups
    return NextResponse.json({
      powerUps: Object.values(POWER_UPS),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    const { powerUpId, quizId } = await request.json();

    const powerUp = Object.values(POWER_UPS).find(p => p.id === powerUpId);
    if (!powerUp) {
      throw apiErrors.invalidInput('Invalid power-up');
    }

    // Verify user has enough currency and deduct
    const prisma = (await import('@/lib/prisma')).default;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gems: true, coins: true },
    });

    if (!user) {
      throw apiErrors.notFound('User');
    }

    // Check if user has enough currency
    if (powerUp.gemCost && user.gems < powerUp.gemCost) {
      throw apiErrors.insufficientBalance(powerUp.gemCost, user.gems);
    }

    if (powerUp.coinCost && user.coins < powerUp.coinCost) {
      throw apiErrors.insufficientBalance(powerUp.coinCost, user.coins);
    }

    // Deduct currency
    const updateData: { gems?: number; coins?: number } = {};
    if (powerUp.gemCost) {
      updateData.gems = user.gems - powerUp.gemCost;
    }
    if (powerUp.coinCost) {
      updateData.coins = user.coins - powerUp.coinCost;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { gems: true, coins: true },
    });

    return NextResponse.json({
      success: true,
      powerUp,
      message: `${powerUp.name} activated!`,
      user: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
