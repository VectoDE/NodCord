import { buildMetadata, normalizeMetadata } from '@/utils/paymentMetadata.util';

describe('normalizeMetadata', () => {
  it('keeps simple keys and stringifies scalars', () => {
    expect(normalizeMetadata({ plan: 'pro', seats: 3, trial: true, nested: { a: 1 } })).toEqual({
      plan: 'pro',
      seats: '3',
      trial: 'true',
    });
  });

  it('drops prototype-related and malformed keys', () => {
    const input = JSON.parse('{"__proto__":"yes","constructor":"x","prototype":"y","a b":"z","ok":"1"}');
    const result = normalizeMetadata(input);
    expect(result).toEqual({ ok: '1' });
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('returns undefined for empty or non-object input', () => {
    expect(normalizeMetadata(undefined)).toBeUndefined();
    expect(normalizeMetadata([])).toBeUndefined();
    expect(normalizeMetadata({})).toBeUndefined();
  });

  it('caps the number of entries at 50', () => {
    const many = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`k${i}`, 'v']));
    expect(Object.keys(normalizeMetadata(many) ?? {})).toHaveLength(50);
  });
});

describe('buildMetadata', () => {
  const user = { id: 'user-1', email: 'u@example.com' } as never;

  it('does not let the client override server keys', () => {
    const result = buildMetadata(
      user,
      { userId: 'victim', userEmail: 'v@example.com', tenantId: 't-2', intent: 'x', plan: 'pro' },
      'one_time',
    );
    expect(result).toEqual({ plan: 'pro', intent: 'one_time', userId: 'user-1', userEmail: 'u@example.com' });
  });

  it('drops reserved keys for anonymous checkouts', () => {
    expect(buildMetadata(undefined, { userId: 'victim', tenantId: 't-2' }, 'subscription')).toEqual({
      intent: 'subscription',
    });
  });
});
