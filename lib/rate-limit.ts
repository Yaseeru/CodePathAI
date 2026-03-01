/**
 * Rate limiting utilities using in-memory storage
 * For production, consider using Upstash Redis or similar
 */

interface RateLimitConfig {
     interval: number; // Time window in milliseconds
     maxRequests: number; // Maximum requests per interval
}

interface RateLimitEntry {
     count: number;
     resetTime: number;
}

// In-memory storage for rate limiting
// In production, use Redis (Upstash) for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
     const now = Date.now();
     const entries = Array.from(rateLimitStore.entries());
     for (const [key, entry] of entries) {
          if (entry.resetTime < now) {
               rateLimitStore.delete(key);
          }
     }
}, 5 * 60 * 1000);

/**
 * Rate limit configurations for different endpoints
 */
export const RateLimitConfigs = {
     AUTH: {
          interval: 60 * 1000, // 1 minute
          maxRequests: 5, // 5 requests per minute
     },
     AI: {
          interval: 10 * 1000, // 10 seconds
          maxRequests: 10, // 10 requests per 10 seconds
     },
     CODE_EXECUTION: {
          interval: 60 * 1000, // 1 minute
          maxRequests: 5, // 5 requests per minute
     },
} as const;

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
     identifier: string,
     config: RateLimitConfig
): {
     allowed: boolean;
     remaining: number;
     resetTime: number;
} {
     const now = Date.now();
     const entry = rateLimitStore.get(identifier);

     // No entry or expired entry
     if (!entry || entry.resetTime < now) {
          const resetTime = now + config.interval;
          rateLimitStore.set(identifier, {
               count: 1,
               resetTime,
          });
          return {
               allowed: true,
               remaining: config.maxRequests - 1,
               resetTime,
          };
     }

     // Entry exists and not expired
     if (entry.count < config.maxRequests) {
          entry.count++;
          return {
               allowed: true,
               remaining: config.maxRequests - entry.count,
               resetTime: entry.resetTime,
          };
     }

     // Rate limit exceeded
     return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
     };
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
     if (userId) {
          return `user:${userId}`;
     }

     // Try to get IP from various headers
     const forwarded = request.headers.get('x-forwarded-for');
     const realIp = request.headers.get('x-real-ip');
     const cfConnectingIp = request.headers.get('cf-connecting-ip');

     const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
     return `ip:${ip}`;
}

/**
 * Middleware to apply rate limiting to API routes
 */
export function withRateLimit(
     handler: (request: Request) => Promise<Response>,
     config: RateLimitConfig
) {
     return async (request: Request): Promise<Response> => {
          const identifier = getClientIdentifier(request);
          const { allowed, remaining, resetTime } = checkRateLimit(identifier, config);

          if (!allowed) {
               const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
               return new Response(
                    JSON.stringify({
                         error: 'Too many requests',
                         retryAfter,
                    }),
                    {
                         status: 429,
                         headers: {
                              'Content-Type': 'application/json',
                              'Retry-After': retryAfter.toString(),
                              'X-RateLimit-Limit': config.maxRequests.toString(),
                              'X-RateLimit-Remaining': '0',
                              'X-RateLimit-Reset': resetTime.toString(),
                         },
                    }
               );
          }

          const response = await handler(request);

          // Add rate limit headers to response
          response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
          response.headers.set('X-RateLimit-Remaining', remaining.toString());
          response.headers.set('X-RateLimit-Reset', resetTime.toString());

          return response;
     };
}
