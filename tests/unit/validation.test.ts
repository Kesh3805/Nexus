import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  escapeHtml,
  isValidEmail,
  isValidUsername,
  validatePassword,
  clampNumber,
  isValidUUID,
  isValidCUID,
  safeJsonParse,
  isValidUrl,
  normalizeSlug,
  isNonEmptyString,
  isValidArray,
} from '@/lib/validation';

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('removes angle brackets', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('handles non-string input', () => {
    expect(sanitizeString(null as any)).toBe('');
    expect(sanitizeString(undefined as any)).toBe('');
    expect(sanitizeString(123 as any)).toBe('');
  });

  it('limits length to 10000 characters', () => {
    const longString = 'a'.repeat(15000);
    expect(sanitizeString(longString).length).toBe(10000);
  });
});

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<div class="test">')).toBe('&lt;div class=&quot;test&quot;&gt;');
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('handles single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidUsername', () => {
  it('accepts valid usernames', () => {
    expect(isValidUsername('user123')).toBe(true);
    expect(isValidUsername('User_Name')).toBe(true);
    expect(isValidUsername('abc')).toBe(true);
  });

  it('rejects invalid usernames', () => {
    expect(isValidUsername('ab')).toBe(false); // too short
    expect(isValidUsername('a'.repeat(21))).toBe(false); // too long
    expect(isValidUsername('user name')).toBe(false); // has space
    expect(isValidUsername('user@name')).toBe(false); // has @
  });
});

describe('validatePassword', () => {
  it('validates strong passwords', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.strength).toBe('good');
  });

  it('rejects weak passwords', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.strength).toBe('weak');
  });

  it('requires uppercase letter', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Need uppercase');
  });

  it('requires lowercase letter', () => {
    const result = validatePassword('PASSWORD123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Need lowercase');
  });

  it('requires number', () => {
    const result = validatePassword('PasswordABC');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Need number');
  });

  it('gives strong rating for passwords with special chars', () => {
    const result = validatePassword('Password123!');
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('strong');
  });
});

describe('clampNumber', () => {
  it('clamps values within range', () => {
    expect(clampNumber(50, 0, 100)).toBe(50);
    expect(clampNumber(-10, 0, 100)).toBe(0);
    expect(clampNumber(150, 0, 100)).toBe(100);
  });

  it('handles NaN with default value', () => {
    expect(clampNumber('not a number', 0, 100, 50)).toBe(50);
    expect(clampNumber(undefined, 0, 100)).toBe(0);
  });
});

describe('isValidUUID', () => {
  it('accepts valid UUIDs', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
  });
});

describe('isValidCUID', () => {
  it('accepts valid CUIDs', () => {
    expect(isValidCUID('cjld2cjxh0000qzrmn831i7rn')).toBe(true);
  });

  it('rejects invalid CUIDs', () => {
    expect(isValidCUID('not-a-cuid')).toBe(false);
    expect(isValidCUID('1234567890123456789012345')).toBe(false); // doesn't start with c
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"name":"test"}', {})).toEqual({ name: 'test' });
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('not json', { default: true })).toEqual({ default: true });
  });
});

describe('isValidUrl', () => {
  it('accepts valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('normalizeSlug', () => {
  it('normalizes strings to valid slugs', () => {
    expect(normalizeSlug('Hello World')).toBe('hello-world');
    expect(normalizeSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    expect(normalizeSlug('Special!@#$Characters')).toBe('specialcharacters');
  });

  it('handles edge cases', () => {
    expect(normalizeSlug('')).toBe('');
    expect(normalizeSlug('---')).toBe('');
  });
});

describe('isNonEmptyString', () => {
  it('returns true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
    expect(isNonEmptyString('  has spaces  ')).toBe(true);
  });

  it('returns false for empty or whitespace strings', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('returns false for non-strings', () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
  });
});

describe('isValidArray', () => {
  it('validates arrays', () => {
    expect(isValidArray([1, 2, 3])).toBe(true);
    expect(isValidArray([])).toBe(true);
  });

  it('rejects non-arrays', () => {
    expect(isValidArray('not an array')).toBe(false);
    expect(isValidArray(null)).toBe(false);
  });

  it('validates with length constraints', () => {
    expect(isValidArray([1, 2, 3], undefined, { minLength: 2 })).toBe(true);
    expect(isValidArray([1], undefined, { minLength: 2 })).toBe(false);
    expect(isValidArray([1, 2, 3], undefined, { maxLength: 2 })).toBe(false);
  });

  it('validates with item validator', () => {
    const isNumber = (x: unknown): x is number => typeof x === 'number';
    expect(isValidArray([1, 2, 3], isNumber)).toBe(true);
    expect(isValidArray([1, 'two', 3], isNumber)).toBe(false);
  });
});
