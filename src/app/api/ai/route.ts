/**
 * Gemini AI API Route - Production-Ready
 * 
 * Features:
 * - Request timeout (10s)
 * - Response validation
 * - Rate limiting (10 requests/minute per user)
 * - Response caching (5 min TTL)
 * - Fallback responses
 * - Input sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserIdFromRequest } from '@/lib/auth';
import { handleApiError, apiErrors } from '@/lib/api-errors';
import { z } from 'zod';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI_TIMEOUT_MS = 10000; // 10 second timeout
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Response cache (in production, use Redis)
const responseCache = new Map<string, { response: string; expiresAt: number }>();

// Initialize Gemini (null if not configured)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const hintRequestSchema = z.object({
  action: z.literal('hint'),
  question: z.string().min(5).max(1000),
  options: z.array(z.string().max(500)).min(2).max(6),
  topic: z.string().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
});

const explainRequestSchema = z.object({
  action: z.literal('explain'),
  question: z.string().min(5).max(1000),
  correctAnswer: z.string().min(1).max(500),
  userAnswer: z.string().min(1).max(500),
  topic: z.string().min(1).max(100),
});

const studyTipsRequestSchema = z.object({
  action: z.literal('study-tips'),
  topics: z.array(z.string().max(100)).min(1).max(10),
  weakAreas: z.array(z.string().max(100)).max(10),
});

const requestSchema = z.discriminatedUnion('action', [
  hintRequestSchema,
  explainRequestSchema,
  studyTipsRequestSchema,
]);

const FALLBACK_HINTS: Record<string, string> = {
  EASY: "Look for the most straightforward answer that directly addresses the question.",
  MEDIUM: "Consider the core concept being tested and eliminate obviously incorrect options.",
  HARD: "Think about edge cases and nuances - the answer may not be the most obvious choice.",
  EXPERT: "This requires deep understanding - consider all implications of each option.",
};

const FALLBACK_EXPLANATION = "This answer demonstrates a key concept in the topic. Review the fundamentals to strengthen your understanding.";

const FALLBACK_TIPS = [
  "Review the core concepts of topics where you scored lower",
  "Practice with more questions to build pattern recognition",
  "Take notes on questions you get wrong to identify knowledge gaps",
];

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function getCacheKey(action: string, data: Record<string, unknown>): string {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return `${action}:${sortedData}`;
}

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.response;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, response: string): void {
  // Limit cache size to prevent memory issues
  if (responseCache.size > 1000) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { response, expiresAt: Date.now() + CACHE_TTL_MS });
}

function sanitizeInput(text: string): string {
  // Remove potential injection attempts and limit length
  return text
    .replace(/[<>{}]/g, '')
    .trim()
    .slice(0, 1000);
}

function validateAIResponse(response: string): string {
  // Ensure response is safe and reasonable
  const sanitized = response
    .trim()
    .slice(0, 2000) // Max 2000 chars
    .replace(/[<>]/g, ''); // Remove potential HTML
  
  if (sanitized.length < 10) {
    throw new Error('AI response too short');
  }
  
  return sanitized;
}

async function callGeminiWithTimeout(
  prompt: string,
  timeoutMs: number = AI_TIMEOUT_MS
): Promise<string> {
  if (!genAI) {
    throw new Error('AI not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('AI request timed out')), timeoutMs);
  });

  try {
    const resultPromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const result = await Promise.race([resultPromise, timeoutPromise]);
    const response = result.response;
    const text = response.text();
    
    return validateAIResponse(text);
  } catch (error) {
    throw error;
  }
}

async function generateHint(data: z.infer<typeof hintRequestSchema>): Promise<NextResponse> {
  const cacheKey = getCacheKey('hint', { q: data.question, d: data.difficulty });
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return NextResponse.json({ hint: cached, cached: true });
  }

  const prompt = `You are a helpful quiz assistant. Give a subtle hint for this question WITHOUT revealing the answer.
Keep it to 1-2 sentences maximum.

Topic: ${sanitizeInput(data.topic)}
Difficulty: ${data.difficulty}
Question: ${sanitizeInput(data.question)}
Options: ${data.options.map(o => sanitizeInput(o)).join(', ')}

Provide ONE helpful hint:`;

  try {
    const hint = await callGeminiWithTimeout(prompt);
    setCachedResponse(cacheKey, hint);
    return NextResponse.json({ hint });
  } catch {
    const fallback = FALLBACK_HINTS[data.difficulty] || FALLBACK_HINTS.MEDIUM;
    return NextResponse.json({ hint: fallback, fallback: true });
  }
}

async function explainAnswer(data: z.infer<typeof explainRequestSchema>): Promise<NextResponse> {
  const isCorrect = data.correctAnswer === data.userAnswer;
  const cacheKey = getCacheKey('explain', { q: data.question, c: data.correctAnswer, u: data.userAnswer });
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return NextResponse.json({ explanation: cached, isCorrect, cached: true });
  }

  const prompt = `You are a quiz teacher. Explain why this answer is ${isCorrect ? 'correct' : 'incorrect'}.
Keep it educational and concise (2-3 sentences max).

Topic: ${sanitizeInput(data.topic)}
Question: ${sanitizeInput(data.question)}
Correct Answer: ${sanitizeInput(data.correctAnswer)}
${!isCorrect ? `Student's Answer: ${sanitizeInput(data.userAnswer)}` : ''}

Explain briefly:`;

  try {
    const explanation = await callGeminiWithTimeout(prompt);
    setCachedResponse(cacheKey, explanation);
    return NextResponse.json({ explanation, isCorrect });
  } catch {
    return NextResponse.json({ 
      explanation: FALLBACK_EXPLANATION, 
      isCorrect,
      fallback: true 
    });
  }
}

async function generateStudyTips(data: z.infer<typeof studyTipsRequestSchema>): Promise<NextResponse> {
  const cacheKey = getCacheKey('tips', { t: data.topics, w: data.weakAreas });
  const cached = getCachedResponse(cacheKey);
  
  if (cached) {
    return NextResponse.json({ tips: cached.split('\n').filter(t => t.trim()), cached: true });
  }

  const prompt = `You are a learning coach. Give exactly 3 brief, actionable study tips based on the student's performance.
Each tip should be one sentence.

Topics studied: ${data.topics.map(t => sanitizeInput(t)).join(', ')}
${data.weakAreas.length > 0 ? `Areas to improve: ${data.weakAreas.map(a => sanitizeInput(a)).join(', ')}` : ''}

Provide 3 tips, one per line:`;

  try {
    const response = await callGeminiWithTimeout(prompt);
    const tips = response.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    
    if (tips.length < 3) {
      throw new Error('Insufficient tips generated');
    }
    
    setCachedResponse(cacheKey, tips.join('\n'));
    return NextResponse.json({ tips });
  } catch {
    return NextResponse.json({ tips: FALLBACK_TIPS, fallback: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      throw apiErrors.unauthorized();
    }

    // 2. Rate limiting
    if (!checkRateLimit(userId)) {
      throw apiErrors.rateLimited(60);
    }

    // 3. Check AI availability
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI features are not available' },
        { status: 503 }
      );
    }

    // 4. Parse and validate input
    const body = await request.json().catch(() => null);
    if (!body) {
      throw apiErrors.invalidInput('Invalid request body');
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      throw apiErrors.invalidInput(parseResult.error.issues[0]?.message || 'Invalid request');
    }

    const data = parseResult.data;

    // 5. Route to appropriate handler
    switch (data.action) {
      case 'hint':
        return await generateHint(data);
      case 'explain':
        return await explainAnswer(data);
      case 'study-tips':
        return await generateStudyTips(data);
      default:
        throw apiErrors.invalidInput('Invalid action');
    }
  } catch (error) {
    return handleApiError(error);
  }
}
