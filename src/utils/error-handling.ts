/**
 * Unified error handling utilities
 * Based on wscats-projects-refactor-spec.md
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain (TypeScript issue with extending Error)
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 'NOT_FOUND', 404);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(message, 'VALIDATION_ERROR', 400, details);
  }

  static unauthorized(): AppError {
    return new AppError('Unauthorized', 'UNAUTHORIZED', 401);
  }

  static forbidden(): AppError {
    return new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  static internal(message: string): AppError {
    return new AppError(message, 'INTERNAL_ERROR', 500);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

/**
 * Result type for avoiding try-catch hell
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Wraps an async function in a Result type
 */
export async function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(
      error instanceof AppError
        ? error
        : new AppError(
            (error as Error).message || 'Unknown error',
            'UNKNOWN_ERROR'
          )
    );
  }
}

/**
 * Wraps a sync function in a Result type
 */
export function safeSync<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (error) {
    return err(
      error instanceof AppError
        ? error
        : new AppError(
            (error as Error).message || 'Unknown error',
            'UNKNOWN_ERROR'
          )
    );
  }
}
