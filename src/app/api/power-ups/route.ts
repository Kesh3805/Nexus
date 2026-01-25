'use server';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return all available power-ups
    return NextResponse.json({
      powerUps: Object.values(POWER_UPS),
    });
  } catch (error) {
    console.error('Power-ups fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { powerUpId, quizId } = await request.json();

    const powerUp = Object.values(POWER_UPS).find(p => p.id === powerUpId);
    if (!powerUp) {
      return NextResponse.json({ error: 'Invalid power-up' }, { status: 400 });
    }

    // In production, verify user has enough gems/coins and deduct
    // For now, just return success
    return NextResponse.json({
      success: true,
      powerUp,
      message: `${powerUp.name} activated!`,
    });
  } catch (error) {
    console.error('Power-up activation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
