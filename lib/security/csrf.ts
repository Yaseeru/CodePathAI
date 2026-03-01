/**
 * CSRF (Cross-Site Request Forgery) Protection
 * 
 * This module provides CSRF token generation and validation
 * for protecting against CSRF attacks.
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_COOKIE = 'csrf-token';

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
     const array = new Uint8Array(32);
     crypto.getRandomValues(array);
     return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest): boolean {
     // Skip CSRF validation for GET, HEAD, OPTIONS requests
     const method = request.method.toUpperCase();
     if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          return true;
     }

     // Get token from header
     const headerToken = request.headers.get(CSRF_TOKEN_HEADER);

     // Get token from cookie
     const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

     // Both tokens must exist and match
     if (!headerToken || !cookieToken) {
          return false;
     }

     return headerToken === cookieToken;
}

/**
 * Middleware to add CSRF token to response
 */
export function withCsrfProtection(
     handler: (request: NextRequest) => Promise<NextResponse>
) {
     return async (request: NextRequest): Promise<NextResponse> => {
          // Validate CSRF token for state-changing requests
          if (!validateCsrfToken(request)) {
               return NextResponse.json(
                    { error: 'Invalid CSRF token' },
                    { status: 403 }
               );
          }

          // Call the handler
          const response = await handler(request);

          // Generate new token if not present
          const existingToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
          if (!existingToken) {
               const newToken = generateCsrfToken();
               response.cookies.set(CSRF_TOKEN_COOKIE, newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24, // 24 hours
               });
          }

          return response;
     };
}

/**
 * Get CSRF token from cookies (for client-side use)
 */
export function getCsrfToken(request: Request): string | null {
     const cookies = request.headers.get('cookie');
     if (!cookies) return null;

     const match = cookies.match(new RegExp(`${CSRF_TOKEN_COOKIE}=([^;]+)`));
     return match ? match[1] : null;
}
