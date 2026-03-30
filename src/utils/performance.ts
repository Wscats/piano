/**
 * Performance optimization utilities
 * Based on wscats-projects-refactor-spec.md
 */

/**
 * Debounce: delays execution until after wait ms have elapsed since last call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle: ensures function is called at most once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
}

/**
 * Memoize: caches function results based on arguments
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: { maxSize?: number; ttl?: number }
): T {
  const cache = new Map<string, { value: unknown; expiry: number }>();
  const maxSize = options?.maxSize ?? 100;
  const ttl = options?.ttl ?? 0; // 0 = no expiry

  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && (!ttl || Date.now() < cached.expiry)) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, {
      value: result,
      expiry: ttl ? Date.now() + ttl : Infinity,
    });

    // Evict oldest entries if cache is too large
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    return result;
  }) as T;
}

/**
 * Simple performance measurement decorator (for class methods)
 */
export function measure(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    const start = performance.now();
    const result = original.apply(this, args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.debug(`[perf] ${propertyKey}: ${duration.toFixed(2)}ms`);
      });
    }

    const duration = performance.now() - start;
    console.debug(`[perf] ${propertyKey}: ${duration.toFixed(2)}ms`);
    return result;
  };

  return descriptor;
}

/**
 * RequestIdleCallback polyfill for scheduling non-critical work
 */
export function scheduleIdle(
  callback: () => void,
  options?: { timeout?: number }
): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => callback(), options);
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Virtual list helper for large data rendering
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { startIndex: number; endIndex: number; offsetY: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const offsetY = startIndex * itemHeight;
  return { startIndex, endIndex, offsetY };
}
