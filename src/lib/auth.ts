import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required. Set it in your .env file.');
  }
  return secret;
}
export const JWT_EXPIRES_IN = '7d';

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string };
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: Request | NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const decoded = verifyToken(authHeader.slice(7));
    return decoded?.userId || null;
  }

  if ('cookies' in request) {
    const cookieToken = (request as NextRequest).cookies.get('token')?.value;
    if (cookieToken) {
      const decoded = verifyToken(cookieToken);
      return decoded?.userId || null;
    }
  }

  return null;
}
