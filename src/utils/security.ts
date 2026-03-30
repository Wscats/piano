/**
 * Security utilities for XSS prevention, input validation, and sanitization
 * Based on wscats-projects-refactor-spec.md
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, char => map[char] || char);
}

/**
 * Validate and sanitize URL to prevent javascript: protocol attacks
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate that a path doesn't escape the allowed directory (path traversal prevention)
 */
export function isPathSafe(inputPath: string, allowedRoot: string): boolean {
  const path = require('path');
  const resolved = path.resolve(inputPath);
  const root = path.resolve(allowedRoot);
  return resolved.startsWith(root + path.sep) || resolved === root;
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Rate limiter for preventing abuse
 */
export class RateLimiter {
  private timestamps = new Map<string, number[]>();

  constructor(
    private maxRequests: number = 60,
    private windowMs: number = 1000
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const times = this.timestamps.get(key) || [];
    const recent = times.filter(t => now - t < this.windowMs);

    if (recent.length >= this.maxRequests) {
      return false;
    }

    recent.push(now);
    this.timestamps.set(key, recent);
    return true;
  }

  reset(key: string): void {
    this.timestamps.delete(key);
  }
}

/**
 * Input validator using a schema-like approach
 */
export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'email' | 'url';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
}

export function validate(
  value: unknown,
  rules: ValidationRule
): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === '') {
    if (rules.required) {
      return { valid: false, error: rules.message || 'Field is required' };
    }
    return { valid: true };
  }

  switch (rules.type) {
    case 'string': {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Must be a string' };
      }
      if (rules.min !== undefined && value.length < rules.min) {
        return { valid: false, error: `Minimum length is ${rules.min}` };
      }
      if (rules.max !== undefined && value.length > rules.max) {
        return { valid: false, error: `Maximum length is ${rules.max}` };
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return { valid: false, error: rules.message || 'Invalid format' };
      }
      break;
    }
    case 'number': {
      const num = typeof value === 'number' ? value : Number(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Must be a number' };
      }
      if (rules.min !== undefined && num < rules.min) {
        return { valid: false, error: `Minimum value is ${rules.min}` };
      }
      if (rules.max !== undefined && num > rules.max) {
        return { valid: false, error: `Maximum value is ${rules.max}` };
      }
      break;
    }
    case 'email': {
      if (!isValidEmail(String(value))) {
        return { valid: false, error: 'Invalid email address' };
      }
      break;
    }
    case 'url': {
      if (!sanitizeURL(String(value))) {
        return { valid: false, error: 'Invalid URL' };
      }
      break;
    }
  }

  return { valid: true };
}
