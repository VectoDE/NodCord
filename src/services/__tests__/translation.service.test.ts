import {
  MAX_RESPONSE_BYTES,
  PUBLIC_LIBRETRANSLATE_HOSTS,
  TranslationFailedError,
  TranslationNotConfiguredError,
  getTranslationConfig,
  isHttpAllowedHost,
  isTranslationConfigured,
  readLimitedBody,
  translateText,
} from '@/services/translation.service';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const configStatus = (url: string) => getTranslationConfig({ LIBRETRANSLATE_URL: url }).status;

describe('translation.service', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  describe('configuration', () => {
    it('is disabled without LIBRETRANSLATE_URL and sends nothing', async () => {
      expect(getTranslationConfig({})).toEqual({ status: 'disabled' });
      expect(getTranslationConfig({ LIBRETRANSLATE_URL: '   ' })).toEqual({ status: 'disabled' });
      expect(isTranslationConfigured({})).toBe(false);
      await expect(translateText('Hallo', 'en', {})).rejects.toBeInstanceOf(
        TranslationNotConfiguredError,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('accepts https for any non-public host', () => {
      expect(configStatus('https://lt.example.org')).toBe('ready');
      expect(configStatus('https://203.0.113.10:5000')).toBe('ready');
    });

    it.each([
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://127.8.9.10',
      'http://[::1]:5000',
      'http://10.0.0.5',
      'http://172.16.0.1',
      'http://172.31.255.254',
      'http://192.168.1.20:5000',
      'http://[fd12:3456::1]',
      'http://[fc00::1]',
      'http://libretranslate:5000',
      'http://LibreTranslate:5000/',
    ])('allows http for local/private/single-label host %s', (url) => {
      expect(configStatus(url)).toBe('ready');
    });

    it.each([
      'http://lt.example.org',
      'http://203.0.113.10',
      'http://172.32.0.1',
      'http://172.15.0.1',
      'http://192.169.0.1',
      'http://11.0.0.1',
      'http://[2001:db8::1]',
      'http://[fe80::1]',
      'http://localhost.example.org',
    ])('rejects http for public host %s', (url) => {
      expect(configStatus(url)).toBe('invalid');
    });

    it.each([
      'https://libretranslate.com',
      'https://LibreTranslate.COM',
      'https://libretranslate.com.',
      'https://portal.libretranslate.com/',
      'https://api.LIBRETRANSLATE.com../translate',
      'https://libretranslate.de',
      'https://translate.argosopentech.com',
      'https://translate.fedilab.app',
      'https://translate.cutie.dating',
      'https://translate.terraprint.co',
      'http://lt.vernccvbvyi5qhfzyqengccj7lkove6bjot2xhh5kajhwvidqafczrad.onion',
      'http://lt.vern.i2p',
    ])('rejects public instance %s', (url) => {
      const config = getTranslationConfig({ LIBRETRANSLATE_URL: url });
      expect(config.status).toBe('invalid');
    });

    it('blocks every listed host including subdomains', () => {
      for (const host of PUBLIC_LIBRETRANSLATE_HOSTS) {
        expect(configStatus(`https://${host}`)).toBe('invalid');
        expect(configStatus(`https://sub.${host}`)).toBe('invalid');
      }
    });

    it('does not block look-alike hosts that only end with a listed name', () => {
      expect(configStatus('https://mylibretranslate.com')).toBe('ready');
      expect(configStatus('https://libretranslate.com.example.org')).toBe('ready');
    });

    it.each([
      'https://user:pass@lt.example.org',
      'https://evil@libretranslate.com',
      'http://127.0.0.1@libretranslate.com',
      'http://localhost:5000@evil.example.org',
      'https://libretranslate.com@lt.example.org',
    ])('rejects userinfo tricks %s', (url) => {
      expect(configStatus(url)).toBe('invalid');
    });

    it('never echoes credentials in the reason', () => {
      const config = getTranslationConfig({
        LIBRETRANSLATE_URL: 'https://admin:s3cret@lt.example.org',
        LIBRETRANSLATE_API_KEY: 'key-123',
      });
      expect(config.status).toBe('invalid');
      expect(JSON.stringify(config)).not.toContain('s3cret');
      expect(JSON.stringify(config)).not.toContain('key-123');
    });

    it.each(['file:///etc/passwd', 'ftp://lt.example.org', 'not a url', 'javascript:alert(1)'])(
      'rejects %s',
      (url) => {
        expect(configStatus(url)).toBe('invalid');
      },
    );

    it('fails closed on invalid configuration without a request', async () => {
      await expect(
        translateText('Hallo', 'en', { LIBRETRANSLATE_URL: 'http://lt.example.org' }),
      ).rejects.toBeInstanceOf(TranslationNotConfiguredError);
      await expect(
        translateText('Hallo', 'en', { LIBRETRANSLATE_URL: 'https://libretranslate.com' }),
      ).rejects.toBeInstanceOf(TranslationNotConfiguredError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('isHttpAllowedHost handles trailing dots and case', () => {
      expect(isHttpAllowedHost('LOCALHOST.')).toBe(true);
      expect(isHttpAllowedHost('example.org')).toBe(false);
      expect(isHttpAllowedHost('')).toBe(false);
    });
  });

  describe('translateText', () => {
    it('calls <base>/translate with the LibreTranslate code', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ translatedText: 'Hello' }));

      const result = await translateText('Hallo', 'zh-Hans', {
        LIBRETRANSLATE_URL: 'https://lt.example.org/base/?x=1#y',
        LIBRETRANSLATE_API_KEY: 'k',
      });

      expect(result).toEqual({ text: 'Hello' });
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toBe('https://lt.example.org/base/translate');
      expect(init.redirect).toBe('error');
      expect(JSON.parse(init.body)).toEqual({
        q: 'Hallo',
        source: 'auto',
        target: 'zh-Hans',
        format: 'text',
        api_key: 'k',
      });
    });

    it('throws with status on HTTP errors', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ error: 'bad' }, 400));
      const error = await translateText('Hallo', 'en', {
        LIBRETRANSLATE_URL: 'https://lt.example.org',
      }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(TranslationFailedError);
      expect((error as TranslationFailedError).status).toBe(400);
    });

    it('rejects text above the length limit without a request', async () => {
      await expect(
        translateText('x'.repeat(1001), 'en', { LIBRETRANSLATE_URL: 'https://lt.example.org' }),
      ).rejects.toBeInstanceOf(TranslationFailedError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects oversized responses', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ translatedText: 'x'.repeat(MAX_RESPONSE_BYTES + 10) }),
      );
      await expect(
        translateText('Hallo', 'en', { LIBRETRANSLATE_URL: 'https://lt.example.org' }),
      ).rejects.toThrow('too large');
    });

    it('rejects invalid JSON', async () => {
      fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }));
      await expect(
        translateText('Hallo', 'en', { LIBRETRANSLATE_URL: 'https://lt.example.org' }),
      ).rejects.toBeInstanceOf(TranslationFailedError);
    });
  });

  describe('readLimitedBody', () => {
    it('rejects early on a large Content-Length', async () => {
      const response = new Response('small', {
        headers: { 'Content-Length': String(MAX_RESPONSE_BYTES + 1) },
      });
      await expect(readLimitedBody(response)).rejects.toThrow('too large');
    });

    it('aborts a stream that grows past the limit', async () => {
      let pulls = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
          pulls += 1;
          controller.enqueue(new Uint8Array(1024));
          if (pulls > 1000) controller.close();
        },
      });
      await expect(readLimitedBody(new Response(stream), 4096)).rejects.toThrow('too large');
      expect(pulls).toBeLessThan(50);
    });

    it('returns bodies within the limit', async () => {
      await expect(readLimitedBody(new Response('abc'), 3)).resolves.toBe('abc');
    });
  });
});
