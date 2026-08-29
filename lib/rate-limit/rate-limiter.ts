import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory fallback sliding window for local development and test environments
const memoryCache = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = memoryCache.get(identifier);

  if (!record || record.resetAt <= now) {
    memoryCache.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}

let authRateLimiter: Ratelimit | undefined;
let signupRateLimiter: Ratelimit | undefined;
let commentRateLimiter: Ratelimit | undefined;
let taskRateLimiter: Ratelimit | undefined;
let clientRateLimiter: Ratelimit | undefined;

function getUpstashRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

/**
 * 5 login attempts per 15 minutes per IP or email
 */
export async function checkLoginRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = getUpstashRedis();
  if (!redis) {
    return memoryRateLimit(`auth:${identifier}`, 5, 15 * 60);
  }

  if (!authRateLimiter) {
    authRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'taskora:ratelimit:auth',
    });
  }

  const result = await authRateLimiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * 5 signup attempts per 1 hour per IP or email
 */
export async function checkSignupRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = getUpstashRedis();
  if (!redis) {
    return memoryRateLimit(`signup:${identifier}`, 5, 60 * 60);
  }

  if (!signupRateLimiter) {
    signupRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      prefix: 'taskora:ratelimit:signup',
    });
  }

  const result = await signupRateLimiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * 10 comments per 10 minutes per user id
 */
export async function checkCommentRateLimit(userId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = getUpstashRedis();
  if (!redis) {
    return memoryRateLimit(`comment:${userId}`, 10, 10 * 60);
  }

  if (!commentRateLimiter) {
    commentRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      prefix: 'taskora:ratelimit:comment',
    });
  }

  const result = await commentRateLimiter.limit(userId);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * 30 tasks per minute per admin
 */
export async function checkTaskCreationRateLimit(adminId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = getUpstashRedis();
  if (!redis) {
    return memoryRateLimit(`task:${adminId}`, 30, 60);
  }

  if (!taskRateLimiter) {
    taskRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'taskora:ratelimit:task',
    });
  }

  const result = await taskRateLimiter.limit(adminId);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

let attachmentRateLimiter: Ratelimit | undefined;

/**
 * 20 client creations per hour per admin
 */
export async function checkClientCreationRateLimit(adminId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = getUpstashRedis();
  if (!redis) {
    return memoryRateLimit(`client:${adminId}`, 20, 60 * 60);
  }

  if (!clientRateLimiter) {
    clientRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      prefix: 'taskora:ratelimit:client',
    });
  }

  const result = await clientRateLimiter.limit(adminId);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * 30 attachment uploads per 10 minutes per admin
 */
export async function checkAttachmentUploadRateLimit(adminId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = getUpstashRedis();
  if (!redis) {
    return memoryRateLimit(`attachment:${adminId}`, 30, 10 * 60);
  }

  if (!attachmentRateLimiter) {
    attachmentRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '10 m'),
      prefix: 'taskora:ratelimit:attachment',
    });
  }

  const result = await attachmentRateLimiter.limit(adminId);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
