/**
 * Input sanitization utilities for XSS protection
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to remove dangerous HTML/JavaScript
 */
export function sanitizeHtml(html: string): string {
     return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
               'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
               'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'img',
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
          ALLOW_DATA_ATTR: false,
     });
}

/**
 * Sanitize user input text (removes HTML tags)
 */
export function sanitizeText(text: string): string {
     return DOMPurify.sanitize(text, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
     });
}

/**
 * Sanitize markdown content (allows safe markdown HTML)
 */
export function sanitizeMarkdown(markdown: string): string {
     return DOMPurify.sanitize(markdown, {
          ALLOWED_TAGS: [
               'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
               'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'img', 'table',
               'thead', 'tbody', 'tr', 'th', 'td',
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
          ALLOW_DATA_ATTR: false,
     });
}

/**
 * Escape special characters for SQL-like queries
 * Note: Use parameterized queries instead when possible
 */
export function escapeSql(input: string): string {
     return input.replace(/['";\\]/g, '\\$&');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
     try {
          const parsed = new URL(url);
          // Only allow http and https protocols
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
               return null;
          }
          return parsed.toString();
     } catch {
          return null;
     }
}

/**
 * Sanitize file name (remove path traversal attempts)
 */
export function sanitizeFileName(fileName: string): string {
     return fileName
          .replace(/\.\./g, '') // Remove parent directory references
          .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
          .substring(0, 255); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
}

/**
 * Sanitize JSON input (prevent prototype pollution)
 */
export function sanitizeJson<T>(json: any): T {
     if (json === null || typeof json !== 'object') {
          return json;
     }

     // Remove dangerous properties
     const dangerous = ['__proto__', 'constructor', 'prototype'];

     if (Array.isArray(json)) {
          return json.map(item => sanitizeJson(item)) as T;
     }

     const sanitized: any = {};
     for (const key in json) {
          if (dangerous.includes(key)) {
               continue;
          }
          sanitized[key] = sanitizeJson(json[key]);
     }

     return sanitized as T;
}
