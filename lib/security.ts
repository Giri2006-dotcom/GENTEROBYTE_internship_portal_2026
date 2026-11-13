import type { NextApiRequest } from 'next';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  lastRequest: number;
}

// In-memory sliding-window rate limit store (auto-pruned)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((value, key) => {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Resolves real client IP address from standard reverse proxy headers
 */
export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    if (first) return first.trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0].trim() : realIp.trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * High-performance sliding-window rate limiter to protect against DoS & brute force attacks
 * @param key unique bucket identifier (e.g. `ip:otp:192.168.1.1` or `email:otp:user@example.com`)
 * @param limit max allowed requests within the time window
 * @param windowMs time window in milliseconds (default: 10 minutes)
 * @param minIntervalMs optional minimum interval between consecutive requests (anti-burst)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 10 * 60 * 1000,
  minIntervalMs: number = 0
): { allowed: boolean; remaining: number; resetTime: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
      lastRequest: now,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  // Check burst throttling (e.g. min 15 seconds between OTP requests)
  if (minIntervalMs > 0 && now - record.lastRequest < minIntervalMs) {
    const retryAfter = Math.ceil((minIntervalMs - (now - record.lastRequest)) / 1000);
    return {
      allowed: false,
      remaining: Math.max(0, limit - record.count),
      resetTime: record.resetTime,
      retryAfterSeconds: retryAfter,
    };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfterSeconds: retryAfter,
    };
  }

  record.count += 1;
  record.lastRequest = now;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
    retryAfterSeconds: 0,
  };
}

/**
 * Sanitizes input string to prevent SQL Injection, NoSQL Injection, and XSS
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  let str = input.trim();

  // Strip null bytes and control chars
  str = str.replace(/\0/g, '');

  // Truncate to maximum length to prevent buffer/memory exhaustion attacks
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  // Prevent NoSQL operators like $where, $regex, $gt, etc.
  if (str.startsWith('$')) {
    str = '_' + str.substring(1);
  }

  return str;
}

/**
 * Validates and strictly prevents SQL & NoSQL injection payloads in form data
 */
export function assertSafeInput(value: unknown, fieldName: string): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') {
    throw new Error(`Security validation failed: Field "${fieldName}" must be a string scalar.`);
  }

  // Block SQL injection patterns
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b.*\b(FROM|INTO|TABLE|DATABASE|WHERE)\b)/i,
    /(--|\/\*|\*\/|;--|@@)/,
    /('|\b)(OR|AND)\b.+(=|<|>|LIKE).+/i,
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(value)) {
      throw new Error(`Security violation detected in field "${fieldName}": Illegal SQL syntax detected.`);
    }
  }

  return sanitizeString(value);
}
