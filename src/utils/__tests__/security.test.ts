/**
 * Tests for security utilities
 */
import {
  sanitizeHTML,
  sanitizeURL,
  isValidEmail,
  isPathSafe,
  generateCSRFToken,
  RateLimiter,
  validate,
} from '../security';

describe('sanitizeHTML', () => {
  test('escapes HTML special characters', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  test('escapes ampersands', () => {
    expect(sanitizeHTML('a & b')).toBe('a &amp; b');
  });

  test('handles empty string', () => {
    expect(sanitizeHTML('')).toBe('');
  });

  test('preserves safe text', () => {
    expect(sanitizeHTML('Hello World 123')).toBe('Hello World 123');
  });
});

describe('sanitizeURL', () => {
  test('allows http URLs', () => {
    expect(sanitizeURL('http://example.com')).toBe('http://example.com/');
  });

  test('allows https URLs', () => {
    expect(sanitizeURL('https://example.com/path?q=1')).toBeTruthy();
  });

  test('blocks javascript: protocol', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('');
  });

  test('blocks data: protocol', () => {
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  test('returns empty for invalid URLs', () => {
    expect(sanitizeURL('not a url')).toBe('');
  });
});

describe('isValidEmail', () => {
  test('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co')).toBe(true);
  });

  test('rejects invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('rejects overly long emails', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe('generateCSRFToken', () => {
  test('generates a non-empty string', () => {
    const token = generateCSRFToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateCSRFToken()));
    expect(tokens.size).toBe(100);
  });
});

describe('RateLimiter', () => {
  test('allows requests within limit', () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(true);
  });

  test('blocks requests exceeding limit', () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    expect(limiter.isAllowed('user1')).toBe(false);
  });

  test('tracks different keys independently', () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user2')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(false);
  });

  test('reset clears the limit for a key', () => {
    const limiter = new RateLimiter(1, 1000);
    limiter.isAllowed('user1');
    expect(limiter.isAllowed('user1')).toBe(false);
    limiter.reset('user1');
    expect(limiter.isAllowed('user1')).toBe(true);
  });
});

describe('validate', () => {
  test('validates required fields', () => {
    expect(validate('', { type: 'string', required: true }).valid).toBe(false);
    expect(validate('hello', { type: 'string', required: true }).valid).toBe(true);
  });

  test('validates string length', () => {
    expect(validate('ab', { type: 'string', min: 3 }).valid).toBe(false);
    expect(validate('abc', { type: 'string', min: 3 }).valid).toBe(true);
    expect(validate('abcdef', { type: 'string', max: 5 }).valid).toBe(false);
  });

  test('validates number range', () => {
    expect(validate(5, { type: 'number', min: 1, max: 10 }).valid).toBe(true);
    expect(validate(0, { type: 'number', min: 1 }).valid).toBe(false);
    expect(validate(11, { type: 'number', max: 10 }).valid).toBe(false);
  });

  test('validates email type', () => {
    expect(validate('user@example.com', { type: 'email' }).valid).toBe(true);
    expect(validate('invalid', { type: 'email' }).valid).toBe(false);
  });

  test('validates pattern', () => {
    expect(validate('abc123', { type: 'string', pattern: /^[a-z0-9]+$/ }).valid).toBe(true);
    expect(validate('ABC!', { type: 'string', pattern: /^[a-z0-9]+$/ }).valid).toBe(false);
  });
});
