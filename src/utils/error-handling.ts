/**
 * Unified error handling utilities.
 * @module error-handling
 */

/**
 * Application-specific error class with error codes.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 'NOT_FOUND', 404);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(message, 'VALIDATION_ERROR', 400, details);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 'FORBIDDEN', 403);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

/**
 * Result type for operations that can fail.
 * Avoids try-catch hell by making errors explicit in the type system.
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Wrap an async function to return a Result instead of throwing.
 */
export async function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new AppError(
        error instanceof Error ? error.message : String(error),
        'UNKNOWN_ERROR',
      ),
    };
  }
}

/**
 * Wrap a sync function to return a Result instead of throwing.
 */
export function safeSync<T>(fn: () => T): Result<T> {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new AppError(
        error instanceof Error ? error.message : String(error),
        'UNKNOWN_ERROR',
      ),
    };
  }
}
