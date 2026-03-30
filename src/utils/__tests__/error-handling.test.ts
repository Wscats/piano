/**
 * Tests for error handling utilities
 */
import { AppError, ok, err, safeAsync, safeSync, Result } from '../error-handling';

describe('AppError', () => {
  test('creates error with correct properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 400, { field: 'name' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: 'name' });
    expect(error.name).toBe('AppError');
  });

  test('creates notFound error', () => {
    const error = AppError.notFound('User');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('User not found');
  });

  test('creates validation error', () => {
    const error = AppError.validation('Invalid email', { field: 'email' });
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  test('creates unauthorized error', () => {
    const error = AppError.unauthorized();
    expect(error.statusCode).toBe(401);
  });

  test('creates forbidden error', () => {
    const error = AppError.forbidden();
    expect(error.statusCode).toBe(403);
  });

  test('serializes to JSON correctly', () => {
    const error = new AppError('Test', 'TEST', 400);
    const json = error.toJSON();
    expect(json.error.code).toBe('TEST');
    expect(json.error.message).toBe('Test');
  });

  test('is instanceof Error', () => {
    const error = new AppError('Test', 'TEST');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('Result helpers', () => {
  test('ok() creates success result', () => {
    const result = ok(42);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(42);
    }
  });

  test('err() creates failure result', () => {
    const error = new AppError('fail', 'FAIL');
    const result = err(error);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('FAIL');
    }
  });
});

describe('safeAsync', () => {
  test('returns ok for successful async function', async () => {
    const result = await safeAsync(async () => 42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(42);
  });

  test('returns err for throwing async function', async () => {
    const result = await safeAsync(async () => {
      throw new Error('async fail');
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toBe('async fail');
  });

  test('preserves AppError type', async () => {
    const result = await safeAsync(async () => {
      throw AppError.notFound('Item');
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.statusCode).toBe(404);
    }
  });
});

describe('safeSync', () => {
  test('returns ok for successful sync function', () => {
    const result = safeSync(() => 'hello');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('hello');
  });

  test('returns err for throwing sync function', () => {
    const result = safeSync(() => {
      throw new Error('sync fail');
    });
    expect(result.success).toBe(false);
  });
});
