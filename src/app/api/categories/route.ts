import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/api-errors';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    const response = NextResponse.json(categories);
    
    // Cache for 5 minutes (categories rarely change)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
