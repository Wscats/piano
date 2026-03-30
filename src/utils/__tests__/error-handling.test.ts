import { AppError, safeAsync, safeSync, Result } from '../error-handling';

describe('Error Handling Utilities', () => {
  describe('AppError', () => {
    test('creates error with code and status', () => {
      const err = new AppError('test', 'TEST_ERROR', 400);
      expect(err.message).toBe('test');
      expect(err.code).toBe('TEST_ERROR');
      expect(err.statusCode).toBe(400);
      expect(err.name).toBe('AppError');
    });

    test('notFound factory', () => {
      const err = AppError.notFound('User');
      expect(err.code).toBe('NOT_FOUND');
      expect(err.statusCode).toBe(404);
      expect(err.message).toContain('User');
    });

    test('validation factory', () => {
      const err = AppError.validation('Invalid input', { field: 'email' });
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.details).toEqual({ field: 'email' });
    });

    test('toJSON serialization', () => {
      const err = new AppError('test', 'CODE', 500);
      const json = err.toJSON();
      expect(json).toHaveProperty('code', 'CODE');
      expect(json).toHaveProperty('message', 'test');
      expect(json).not.toHaveProperty('stack');
    });
  });

  describe('safeAsync', () => {
    test('returns success for resolved promise', async () => {
      const result = await safeAsync(async () => 42);
      expect(result).toEqual({ success: true, data: 42 });
    });

    test('returns error for rejected promise', async () => {
      const result = await safeAsync(async () => {
        throw new Error('fail');
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNKNOWN_ERROR');
      }
    });

    test('preserves AppError', async () => {
      const result = await safeAsync(async () => {
        throw AppError.notFound('Item');
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('safeSync', () => {
    test('returns success for normal execution', () => {
      const result = safeSync(() => 'hello');
      expect(result).toEqual({ success: true, data: 'hello' });
    });

    test('returns error for thrown exception', () => {
      const result = safeSync(() => {
        throw new Error('sync fail');
      });
      expect(result.success).toBe(false);
    });
  });
});
