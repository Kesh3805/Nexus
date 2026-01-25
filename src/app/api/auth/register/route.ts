import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, username, password, displayName } = await request.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || username,
        avatarSeed: Math.random().toString(36).slice(2),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarStyle: true,
        avatarSeed: true,
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

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Give first achievement
    const firstAchievement = await prisma.achievement.findFirst({
      where: { name: 'First Steps' },
    });

    if (firstAchievement) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to Nexus Quiz!',
          message: 'Your journey begins now. Complete your first quiz to earn achievements!',
        },
      });
    }

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
