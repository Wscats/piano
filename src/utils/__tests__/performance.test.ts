import { debounce, throttle, memoize, retry } from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    test('delays function execution', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
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
  });

  describe('throttle', () => {
    test('limits function calls to interval', () => {
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
      const fn = jest.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('respects max cache size', () => {
      const fn = jest.fn((x: number) => x);
      const memoized = memoize(fn, 2);

      memoized(1);
      memoized(2);
      memoized(3); // evicts 1

      expect(fn).toHaveBeenCalledTimes(3);
      memoized(2); // still cached
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('retry', () => {
    test('succeeds on first try', async () => {
      jest.useRealTimers();
      const fn = jest.fn().mockResolvedValue('ok');
      const result = await retry(fn, 3, 10);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('retries on failure then succeeds', async () => {
      jest.useRealTimers();
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('ok');
      const result = await retry(fn, 3, 10);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('throws after max retries', async () => {
      jest.useRealTimers();
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));
      await expect(retry(fn, 2, 10)).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
