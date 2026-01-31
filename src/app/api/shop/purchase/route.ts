import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError, apiErrors } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    const { itemId, gemPrice, coinPrice } = await request.json();

    if (!itemId) {
      throw apiErrors.missingField('itemId');
    }

    // Verify item exists
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!shopItem) {
      throw apiErrors.notFound('Shop item');
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gems: true, coins: true },
    });

    if (!user) {
      throw apiErrors.notFound('User');
    }

    // Validate prices match shop item
    const actualGemPrice = shopItem.gemPrice || 0;
    const actualCoinPrice = shopItem.coinPrice || 0;

    // Check if user has enough currency
    if (actualGemPrice > 0 && user.gems < actualGemPrice) {
      throw apiErrors.insufficientBalance(actualGemPrice, user.gems);
    }

    if (actualCoinPrice > 0 && user.coins < actualCoinPrice) {
      throw apiErrors.insufficientBalance(actualCoinPrice, user.coins);
    }

    // Check if user already owns this item (prevent duplicate purchases)
    const existingItem = await prisma.userItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    if (existingItem) {
      throw apiErrors.alreadyExists('Item already purchased');
    }

    // Deduct currency
    const updateData: { gems?: number; coins?: number } = {};
    if (actualGemPrice > 0) {
      updateData.gems = user.gems - actualGemPrice;
    }
    if (actualCoinPrice > 0) {
      updateData.coins = user.coins - actualCoinPrice;
    }

    // Update user and create UserItem record in transaction
    const [updatedUser, userItem] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, gems: true, coins: true, level: true, xp: true, totalXp: true },
      }),
      prisma.userItem.create({
        data: {
          userId,
          itemId,
          quantity: 1,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      item: userItem,
      message: 'Purchase successful!',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
