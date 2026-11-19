import {
  normalizeOrigin,
  parseOriginList,
  findAllowedOrigin,
  requestSourceOrigin,
} from '@/utils/origin.util';

describe('origin.util', () => {
  it('normalizes valid http(s) origins and rejects everything else', () => {
    expect(normalizeOrigin('https://Example.com/path?q=1')).toBe('https://example.com');
    expect(normalizeOrigin('http://localhost:4000')).toBe('http://localhost:4000');
    expect(normalizeOrigin('null')).toBeNull();
    expect(normalizeOrigin('')).toBeNull();
    expect(normalizeOrigin(undefined)).toBeNull();
    expect(normalizeOrigin('localhost')).toBeNull();
    expect(normalizeOrigin('javascript:alert(1)')).toBeNull();
    expect(normalizeOrigin('*')).toBeNull();
  });

  it('parses comma separated origin lists and drops wildcards', () => {
    expect(parseOriginList('https://a.example, *, http://b.example:8080 ,null')).toEqual([
      'https://a.example',
      'http://b.example:8080',
    ]);
    expect(parseOriginList(undefined)).toEqual([]);
  });

  it('returns the allow-list entry, never an arbitrary request origin', () => {
    const allow = ['https://app.example/'];
    expect(findAllowedOrigin('https://app.example', allow)).toBe('https://app.example');
    expect(findAllowedOrigin('https://evil.example', allow)).toBeUndefined();
    expect(findAllowedOrigin('https://app.example.evil.example', allow)).toBeUndefined();
    expect(findAllowedOrigin(undefined, allow)).toBeUndefined();
  });

  it('prefers the Origin header and falls back to Referer', () => {
    expect(requestSourceOrigin('https://a.example', 'https://b.example/x')).toBe(
      'https://a.example',
    );
    expect(requestSourceOrigin(undefined, 'https://b.example/x?y=1')).toBe('https://b.example');
    expect(requestSourceOrigin('null', 'https://b.example/x')).toBeNull();
    expect(requestSourceOrigin(undefined, undefined)).toBeNull();
  });
});
