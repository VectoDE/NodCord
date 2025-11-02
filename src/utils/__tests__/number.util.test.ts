import {
  clamp,
  safeDivide,
  nearlyEqual,
  humanizeBytes,
  percent,
} from '@/utils/number.util';

describe('number.util', () => {
  it('clamps values to the provided range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(25, 0, 10)).toBe(10);
  });

  it('performs safe division with fallback', () => {
    expect(safeDivide(10, 2)).toBe(5);
    expect(safeDivide(10, 0, -1)).toBe(-1);
    expect(safeDivide(Number.NaN, 2, 42)).toBe(42);
  });

  it('compares floating point numbers with tolerance', () => {
    expect(nearlyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(nearlyEqual(1, 1.0000001, 1e-9)).toBe(false);
  });

  it('converts bytes to human readable strings', () => {
    expect(humanizeBytes(1024)).toBe('1 KB');
    expect(humanizeBytes(1024, 1, true)).toBe('1 KiB');
  });

  it('calculates percentages safely', () => {
    expect(percent(50, 200)).toBe(25);
    expect(percent(50, 0, 0)).toBe(0);
  });
});
