import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError, apiErrors } from '@/lib/api-errors';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            text: true,
            options: true,
            order: true,
            points: true,
            explanation: true,
          },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!quiz) {
      throw apiErrors.notFound('Quiz');
    }

    // Parse options for each question
    const quizWithParsedQuestions = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options as string),
      })),
    };

    const response = NextResponse.json(quizWithParsedQuestions);
    
    // Cache for 10 minutes (quiz content is static)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
