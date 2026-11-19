import { resolveClientPublicUrl } from '@/utils/clientUrl.util';

describe('resolveClientPublicUrl', () => {
  const url = (env: Record<string, string | undefined>, port = 4000) => resolveClientPublicUrl(port, env);

  it('uses a full URL as it is', () => {
    expect(url({ CLIENT_BASE_URL: 'http://localhost:4000', CLIENT_HTTPS: 'false' })).toBe('http://localhost:4000');
    expect(url({ CLIENT_BASE_URL: 'https://app.example.com/path' })).toBe('https://app.example.com');
  });

  it('builds the URL from host, flag and port', () => {
    expect(url({ CLIENT_BASE_URL: 'example.com', CLIENT_HTTPS: 'true' })).toBe('https://example.com:4000');
    expect(url({ CLIENT_BASE_URL: 'example.com', CLIENT_HTTPS: 'https' })).toBe('https://example.com:4000');
    expect(url({ CLIENT_BASE_URL: 'example.com', CLIENT_HTTPS: 'false' })).toBe('http://example.com:4000');
    expect(url({})).toBe('http://localhost:4000');
  });

  it('does not double the port for host:port values', () => {
    expect(url({ CLIENT_BASE_URL: 'localhost:4000' })).toBe('http://localhost:4000');
    expect(url({ CLIENT_BASE_URL: 'example.com:8443', CLIENT_HTTPS: 'true' }, 8443)).toBe('https://example.com:8443');
  });

  it('drops credentials and paths from schemeless values', () => {
    expect(url({ CLIENT_BASE_URL: 'user:pass@example.com/x' })).toBe('http://example.com:4000');
  });
});
