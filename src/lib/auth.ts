import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in your .env file.');
}

export { JWT_SECRET };
export const JWT_EXPIRES_IN = '7d';

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as { userId: string };
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
