import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check streak
    const now = new Date();
    const lastActive = new Date(user.lastActiveAt);
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    let newStreak = user.streak;
    if (hoursSinceActive > 48) {
      // Lost streak
      newStreak = 0;
    } else if (hoursSinceActive > 24) {
      // New day, maintain or continue streak
      newStreak = user.streak; // Will be incremented on first quiz
    }

    // Update last active
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastActiveAt: now,
        streak: newStreak,
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
      { userId: updatedUser.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ user: updatedUser, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
