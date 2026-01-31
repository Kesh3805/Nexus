import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getRateLimitHeaders,
  resetRateLimit,
  clearAllRateLimits,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('allows requests under the limit', () => {
      const result = checkRateLimit('test-user', { limit: 5, windowSeconds: 60 });
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('decrements remaining count on each request', () => {
      const config = { limit: 3, windowSeconds: 60 };
      
      let result = checkRateLimit('user-1', config);
      expect(result.remaining).toBe(2);
      
      result = checkRateLimit('user-1', config);
      expect(result.remaining).toBe(1);
      
      result = checkRateLimit('user-1', config);
      expect(result.remaining).toBe(0);
    });

    it('blocks requests over the limit', () => {
      const config = { limit: 2, windowSeconds: 60 };
      
      checkRateLimit('blocked-user', config);
      checkRateLimit('blocked-user', config);
      
      const result = checkRateLimit('blocked-user', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('tracks different identifiers separately', () => {
      const config = { limit: 2, windowSeconds: 60 };
      
      checkRateLimit('user-a', config);
      checkRateLimit('user-a', config);
      
      const resultA = checkRateLimit('user-a', config);
      const resultB = checkRateLimit('user-b', config);
      
      expect(resultA.success).toBe(false);
      expect(resultB.success).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('resets the rate limit for a specific identifier', () => {
      const config = { limit: 2, windowSeconds: 60 };
      
      checkRateLimit('reset-test', config);
      checkRateLimit('reset-test', config);
      
      let result = checkRateLimit('reset-test', config);
      expect(result.success).toBe(false);
      
      resetRateLimit('reset-test');
      
      result = checkRateLimit('reset-test', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('clearAllRateLimits', () => {
    it('clears all rate limits', () => {
      const config = { limit: 1, windowSeconds: 60 };
      
      checkRateLimit('user-1', config);
      checkRateLimit('user-2', config);
      
      expect(checkRateLimit('user-1', config).success).toBe(false);
      expect(checkRateLimit('user-2', config).success).toBe(false);
      
      clearAllRateLimits();
      
      expect(checkRateLimit('user-1', config).success).toBe(true);
      expect(checkRateLimit('user-2', config).success).toBe(true);
    });
  });

  describe('getRateLimitHeaders', () => {
    it('returns proper rate limit headers', () => {
      const result = checkRateLimit('header-test', { limit: 10, windowSeconds: 60 });
      const headers = getRateLimitHeaders(result);
      
      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('9');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('has predefined configurations', () => {
      expect(RATE_LIMIT_CONFIGS.auth).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.api).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.quiz).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.ai).toBeDefined();
      
      expect(RATE_LIMIT_CONFIGS.auth.limit).toBe(5);
      expect(RATE_LIMIT_CONFIGS.api.limit).toBe(60);
    });
  });
});
