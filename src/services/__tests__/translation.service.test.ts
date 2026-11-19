import {
  TranslationFailedError,
  TranslationNotConfiguredError,
  getTranslationProvider,
  translateText,
} from '@/services/translation.service';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('translation.service', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  it('reports no provider without configuration', async () => {
    expect(getTranslationProvider({})).toBeNull();
    await expect(translateText('Hallo', 'en', {})).rejects.toBeInstanceOf(
      TranslationNotConfiguredError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prefers LibreTranslate over DeepL', () => {
    expect(
      getTranslationProvider({ LIBRETRANSLATE_URL: 'https://lt.example', DEEPL_API_KEY: 'k:fx' }),
    ).toBe('libretranslate');
    expect(getTranslationProvider({ DEEPL_API_KEY: 'k:fx' })).toBe('deepl');
  });

  it('calls LibreTranslate /translate', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ translatedText: 'Hello' }));

    const result = await translateText('Hallo', 'zh-CN', {
      LIBRETRANSLATE_URL: 'https://lt.example/base/',
    });

    expect(result).toEqual({ text: 'Hello', provider: 'libretranslate' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://lt.example/base/translate');
    expect(JSON.parse(init.body)).toMatchObject({ q: 'Hallo', target: 'zh', source: 'auto' });
  });

  it('rejects non-http LibreTranslate URLs', async () => {
    await expect(
      translateText('Hallo', 'en', { LIBRETRANSLATE_URL: 'file:///etc/passwd' }),
    ).rejects.toBeInstanceOf(TranslationFailedError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the DeepL free endpoint for :fx keys', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ translations: [{ text: 'Hello' }] }));

    const result = await translateText('Hallo', 'en', { DEEPL_API_KEY: 'abc:fx' });

    expect(result).toEqual({ text: 'Hello', provider: 'deepl' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://api-free.deepl.com/v2/translate');
    expect(init.headers.Authorization).toBe('DeepL-Auth-Key abc:fx');
    expect(JSON.parse(init.body)).toEqual({ text: ['Hallo'], target_lang: 'EN-US' });
  });

  it('throws on HTTP errors', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'quota' }, 456));
    await expect(
      translateText('Hallo', 'en', { DEEPL_API_KEY: 'abc:fx' }),
    ).rejects.toBeInstanceOf(TranslationFailedError);
  });
});
