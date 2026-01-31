import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError, apiErrors } from '@/lib/api-errors';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        quizzes: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw apiErrors.notFound('Category');
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error);
  }
}
