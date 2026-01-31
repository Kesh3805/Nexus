interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60000; // 1 minute

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export const RATE_LIMIT_CONFIGS = {
  auth: { limit: 5, windowSeconds: 60 },
  api: { limit: 60, windowSeconds: 60 },
  quiz: { limit: 10, windowSeconds: 60 },
  ai: { limit: 5, windowSeconds: 60 },
} as const;

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Time-based cleanup (more predictable than random)
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanupExpiredEntries();
    lastCleanup = now;
  }

  const entry = store.get(identifier);

  if (!entry || now >= entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(identifier, newEntry);
    
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

export function getIdentifier(request: Request, userId?: string | null): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return userId ? `${ip}:${userId}` : ip;
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now >= entry.resetTime) store.delete(key);
  });
}

export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

export function clearAllRateLimits(): void {
  store.clear();
}
