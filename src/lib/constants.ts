// Gamification
export const XP_CONSTANTS = {
  BASE_XP: 100,
  LEVEL_MULTIPLIER: 1.5,
  MAX_STREAK_MULTIPLIER: 1.0,
  STREAK_BONUS_INCREMENT: 0.1,
  SPEED_BONUS_PERCENTAGE: 0.2,
  PERFECT_BONUS_PERCENTAGE: 0.5,
} as const;

export const STREAK_CONSTANTS = {
  STREAK_BREAK_HOURS: 48,
  NEW_DAY_HOURS: 24,
} as const;

export const CURRENCY_DEFAULTS = {
  INITIAL_GEMS: 100,
  INITIAL_COINS: 500,
} as const;

// Validation
export const VALIDATION_LIMITS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 8,
  DISPLAY_NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  EMAIL_MAX_LENGTH: 254,
  MAX_TIME_SPENT: 3600,
  MAX_STRING_LENGTH: 10000,
} as const;

// Rate Limits
export const RATE_LIMITS = {
  AUTH: { limit: 5, windowSeconds: 60 },
  API: { limit: 60, windowSeconds: 60 },
  QUIZ: { limit: 10, windowSeconds: 60 },
  AI: { limit: 5, windowSeconds: 60 },
} as const;

// Timing
export const CACHE_DURATIONS = {
  API_CACHE_MS: 5 * 60 * 1000,
  TOKEN_EXPIRY: '7d',
  DAILY_RESET_HOURS: 24,
} as const;

export const TIMEOUTS = {
  API_TIMEOUT_MS: 30000,
  ANIMATION_FAST_MS: 150,
  ANIMATION_NORMAL_MS: 300,
  ANIMATION_SLOW_MS: 500,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  LEADERBOARD_SIZE: 50,
} as const;

export const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'bottts-neutral',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'shapes',
  'thumbs',
] as const;

export const DIFFICULTY_VALUES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT', 'NIGHTMARE'] as const;

export const RARITY_VALUES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'] as const;

export const PUBLIC_ROUTES = ['/', '/login', '/register'] as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/quiz',
  '/leaderboard',
  '/achievements',
  '/shop',
  '/friends',
  '/battle',
  '/analytics',
  '/daily-challenge',
] as const;

export const FEATURES = {
  AI_EXPLANATIONS: true,
  VOICE_INPUT: false,
  BATTLE_MODE: true,
  CAMPAIGN_SIMULATOR: true,
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong',
  UNAUTHORIZED: 'Please log in',
  NOT_FOUND: 'Not found',
  RATE_LIMITED: 'Too many requests',
  VALIDATION_FAILED: 'Invalid input',
  NETWORK_ERROR: 'Network error',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created!',
  PROFILE_UPDATED: 'Profile updated',
  QUIZ_COMPLETED: 'Quiz completed!',
  PURCHASE_SUCCESS: 'Purchase complete!',
} as const;
