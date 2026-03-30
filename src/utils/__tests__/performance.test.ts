/**
 * Tests for performance utilities
 */
import { debounce, throttle, memoize, getVisibleRange } from '../performance';

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('delays function execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('resets timer on subsequent calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(50);
    debounced();
    jest.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('passes arguments to the original function', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced('a', 'b');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });
});

describe('throttle', () => {
  test('calls function immediately on first call', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('blocks calls within interval', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('memoize', () => {
  test('caches function results', () => {
    let callCount = 0;
    const fn = (x: unknown) => { callCount++; return (x as number) * 2; };
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(callCount).toBe(1);
  });

  test('differentiates by arguments', () => {
    let callCount = 0;
    const fn = (x: unknown) => { callCount++; return (x as number) * 2; };
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(3)).toBe(6);
    expect(callCount).toBe(2);
  });

  test('respects maxSize option', () => {
    let callCount = 0;
    const fn = (x: unknown) => { callCount++; return x; };
    const memoized = memoize(fn, { maxSize: 2 });

    memoized(1);
    memoized(2);
    memoized(3); // Should evict cache for 1
    const before = callCount;
    memoized(1); // Should recompute
    expect(callCount).toBe(before + 1);
  });
});

describe('getVisibleRange', () => {
  test('calculates visible range correctly', () => {
    const result = getVisibleRange(0, 500, 50, 100);
    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBeLessThanOrEqual(13); // 10 visible + 3 overscan
    expect(result.offsetY).toBe(0);
  });

  test('handles scroll offset', () => {
    const result = getVisibleRange(500, 500, 50, 100);
    expect(result.startIndex).toBeGreaterThan(0);
    expect(result.offsetY).toBeGreaterThan(0);
  });

  test('clamps to total items', () => {
    const result = getVisibleRange(9000, 500, 50, 100);
    expect(result.endIndex).toBeLessThanOrEqual(100);
  });

  test('applies overscan', () => {
    const result = getVisibleRange(250, 500, 50, 100, 5);
    expect(result.startIndex).toBeLessThanOrEqual(0);
  });
});
