import { logSafe } from '@/utils/logSafe.util';

describe('logSafe', () => {
  it('removes line breaks and control characters', () => {
    expect(logSafe('a\r\nb')).toBe('a  b');
    expect(logSafe('x\u0000y\u001b[31mz\u2028')).toBe('xy[31mz');
  });

  it('stringifies non-strings and handles nullish values', () => {
    expect(logSafe(42)).toBe('42');
    expect(logSafe(undefined)).toBe('');
    expect(logSafe(null)).toBe('');
  });

  it('truncates long values', () => {
    expect(logSafe('a'.repeat(10), 4)).toBe('aaaa…');
  });
});
