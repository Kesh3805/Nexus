import { NextResponse } from 'next/server';

export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  COOLDOWN_ACTIVE = 'COOLDOWN_ACTIVE',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (process.env.NODE_ENV === 'development') {
    console.error('[API]', error);
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'A record with this information already exists', code: ApiErrorCode.DUPLICATE_ENTRY },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found', code: ApiErrorCode.NOT_FOUND },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'Related record not found', code: ApiErrorCode.NOT_FOUND },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { 
            error: 'Database operation failed',
            code: ApiErrorCode.DATABASE_ERROR,
            ...(process.env.NODE_ENV === 'development' && { details: prismaError.message }),
          },
          { status: 500 }
        );
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: ApiErrorCode.INTERNAL_ERROR,
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: 500 }
    );
  }

  // Unknown errors
  return NextResponse.json(
    { error: 'An unexpected error occurred', code: ApiErrorCode.INTERNAL_ERROR },
    { status: 500 }
  );
}

export const apiErrors = {
  unauthorized: (msg = 'Unauthorized') => new ApiError(ApiErrorCode.UNAUTHORIZED, msg, 401),
  invalidCredentials: (msg = 'Invalid credentials') => new ApiError(ApiErrorCode.INVALID_CREDENTIALS, msg, 401),
  notFound: (resource: string) => new ApiError(ApiErrorCode.NOT_FOUND, `${resource} not found`, 404),
  invalidInput: (msg: string) => new ApiError(ApiErrorCode.INVALID_INPUT, msg, 400),
  missingField: (field: string) => new ApiError(ApiErrorCode.MISSING_REQUIRED_FIELD, `Missing: ${field}`, 400),
  alreadyExists: (msg: string) => new ApiError(ApiErrorCode.ALREADY_EXISTS, msg, 409),
  insufficientBalance: (required: number, current: number) =>
    new ApiError(ApiErrorCode.INSUFFICIENT_BALANCE, `Insufficient balance (need ${required}, have ${current})`, 400),
  alreadyCompleted: (resource: string) => new ApiError(ApiErrorCode.ALREADY_COMPLETED, `${resource} already completed today`, 400),
  cooldownActive: (seconds: number) => new ApiError(ApiErrorCode.COOLDOWN_ACTIVE, `Wait ${seconds}s`, 429, { remainingTime: seconds }),
  rateLimited: (seconds = 60) => new ApiError(ApiErrorCode.RATE_LIMITED, `Rate limited. Retry in ${seconds}s`, 429, { retryAfter: seconds }),
};
