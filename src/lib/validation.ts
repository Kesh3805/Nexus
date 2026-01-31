export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '').slice(0, 10000);
}

export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return input.replace(/[&<>"']/g, (c) => entities[c] || c);
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidUsername(username: string): boolean {
  if (typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  if (typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'], strength: 'weak' };
  }

  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) errors.push('Min 8 characters');
  else { score++; if (password.length >= 12) score++; }

  if (!/[A-Z]/.test(password)) errors.push('Need uppercase');
  else score++;

  if (!/[a-z]/.test(password)) errors.push('Need lowercase');
  else score++;

  if (!/[0-9]/.test(password)) errors.push('Need number');
  else score++;

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  const strength = score <= 2 ? 'weak' : score <= 3 ? 'fair' : score <= 4 ? 'good' : 'strong';
  return { isValid: errors.length === 0, errors, strength };
}

/**
 * Validate and clamp a number within a range
 */
export function clampNumber(value: unknown, min: number, max: number, defaultValue: number = min): number {
  const num = Number(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidCUID(cuid: string): boolean {
  if (typeof cuid !== 'string') return false;
  return /^c[a-z0-9]{24}$/.test(cuid);
}

export function safeJsonParse<T = unknown>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function isValidUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function normalizeSlug(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidArray<T>(
  value: unknown,
  itemValidator?: (item: unknown) => item is T,
  options?: { minLength?: number; maxLength?: number }
): value is T[] {
  if (!Array.isArray(value)) return false;
  if (options?.minLength !== undefined && value.length < options.minLength) return false;
  if (options?.maxLength !== undefined && value.length > options.maxLength) return false;
  if (itemValidator) return value.every(itemValidator);
  return true;
}
