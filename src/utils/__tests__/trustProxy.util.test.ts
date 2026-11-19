import { resolveTrustProxyHops } from '@/utils/trustProxy.util';

describe('resolveTrustProxyHops', () => {
  it('defaults to 1', () => {
    expect(resolveTrustProxyHops('   ')).toBe(1);
    expect(resolveTrustProxyHops('')).toBe(1);
  });

  it('accepts small integers', () => {
    expect(resolveTrustProxyHops('0')).toBe(0);
    expect(resolveTrustProxyHops('2')).toBe(2);
    expect(resolveTrustProxyHops(' 2 ')).toBe(2);
    expect(resolveTrustProxyHops('10')).toBe(10);
    expect(resolveTrustProxyHops('05')).toBe(5);
  });

  it('rejects free text and large values', () => {
    expect(resolveTrustProxyHops('true')).toBe(1);
    expect(resolveTrustProxyHops('-1')).toBe(1);
    expect(resolveTrustProxyHops('11')).toBe(1);
  });
});
