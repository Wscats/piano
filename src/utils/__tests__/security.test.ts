import { sanitizeHTML, isPathSafe, isValidEmail, RateLimiter } from '../security';

describe('Security Utilities', () => {
  describe('sanitizeHTML', () => {
    test('escapes HTML special characters', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    test('handles empty string', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    test('preserves safe text', () => {
      expect(sanitizeHTML('Hello World')).toBe('Hello World');
    });
  });

  describe('isPathSafe', () => {
    test('allows paths within root', () => {
      expect(isPathSafe('/app/data/file.txt', '/app')).toBe(true);
    });

    test('rejects path traversal', () => {
      expect(isPathSafe('/app/../etc/passwd', '/app')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    test('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    test('rejects invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    test('allows requests within limit', () => {
      const limiter = new RateLimiter(3, 1);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
    });

    test('blocks requests over limit', () => {
      const limiter = new RateLimiter(1, 0.001);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(false);
    });
  });
});
