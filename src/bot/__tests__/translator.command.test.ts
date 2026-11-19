import type { ChatInputCommandInteraction } from 'discord.js';

import {
  CONSENT_ACCEPT_ID,
  CONSENT_DECLINE_ID,
  LANGUAGE_CHOICES,
  NOT_CONFIGURED_MESSAGE,
  TRANSLATION_FOOTER,
  createTranslateCommand,
  type TranslateDeps,
} from '@/bot/commands/Community/translator.community';
import { createTranslateConsentCommand } from '@/bot/commands/Community/translateConsent.community';
import { TranslationFailedError } from '@/services/translation.service';
import {
  TRANSLATION_CONSENT_VERSION,
  UserCooldown,
  type TranslationConsentStore,
} from '@/services/translationConsent.service';

jest.mock('@/services/prisma.service', () => ({ __esModule: true, default: {}, prisma: {} }));
jest.mock('@/services/logger.service', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

class MemoryConsentStore implements TranslationConsentStore {
  readonly rows = new Map<string, number>();

  async hasConsent(userId: string, version: number) {
    const stored = this.rows.get(userId);
    return stored !== undefined && stored >= version;
  }

  async grant(userId: string, version: number) {
    this.rows.set(userId, version);
  }

  async revoke(userId: string) {
    return this.rows.delete(userId);
  }
}

type ButtonOutcome = { customId: string; userId?: string } | 'timeout';

interface FakeOptions {
  text?: string;
  to?: string;
  hidden?: boolean | null;
  subcommand?: string;
  button?: ButtonOutcome;
}

function fakeInteraction(opts: FakeOptions = {}) {
  const buttonUpdate = jest.fn().mockResolvedValue(undefined);
  const state = { replied: false, deferred: false };
  const awaitMessageComponent = jest.fn(
    async ({ filter }: { filter: (i: { user: { id: string } }) => boolean }) => {
      const outcome = opts.button ?? 'timeout';
      if (outcome === 'timeout') throw new Error('time');
      const button = {
        customId: outcome.customId,
        user: { id: outcome.userId ?? 'user-1' },
        update: buttonUpdate,
      };
      if (!filter(button)) throw new Error('time');
      return button;
    },
  );
  const interaction = {
    user: { id: 'user-1' },
    get replied() {
      return state.replied;
    },
    get deferred() {
      return state.deferred;
    },
    options: {
      getString: jest.fn((name: string) => (name === 'text' ? (opts.text ?? 'Hallo') : (opts.to ?? 'en'))),
      getBoolean: jest.fn(() => opts.hidden ?? null),
      getSubcommand: jest.fn(() => opts.subcommand ?? 'status'),
    },
    reply: jest.fn(async () => {
      state.replied = true;
    }),
    deferReply: jest.fn(async () => {
      state.deferred = true;
    }),
    editReply: jest.fn().mockResolvedValue(undefined),
    followUp: jest.fn().mockResolvedValue(undefined),
    fetchReply: jest.fn(async () => ({ awaitMessageComponent })),
  };
  return {
    interaction,
    awaitMessageComponent,
    buttonUpdate,
    asCommand: interaction as unknown as ChatInputCommandInteraction,
  };
}

function makeDeps(overrides: Partial<TranslateDeps> = {}) {
  const store = new MemoryConsentStore();
  const translate = jest.fn(async (text: string) => ({ text: `[en] ${text}` }));
  const deps: TranslateDeps = {
    consentStore: store,
    translate,
    isConfigured: () => true,
    cooldown: new UserCooldown(10_000),
    consentTimeoutMs: 1_000,
    ...overrides,
  };
  return { deps, store, translate };
}

const embedOf = (call: unknown) =>
  ((call as { embeds: Array<{ toJSON: () => Record<string, unknown> }> }).embeds[0]?.toJSON() ??
    {}) as { footer?: { text?: string }; fields?: Array<{ value: string }> };

describe('/translate', () => {
  it('reports "not configured" and sends nothing when the service is off', async () => {
    const { deps, translate } = makeDeps({ isConfigured: () => false });
    const fake = fakeInteraction();
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);

    expect(fake.interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: NOT_CONFIGURED_MESSAGE }),
    );
    expect(fake.interaction.fetchReply).not.toHaveBeenCalled();
    expect(translate).not.toHaveBeenCalled();
  });

  it('asks for consent first and does not translate without it (decline)', async () => {
    const { deps, store, translate } = makeDeps();
    const fake = fakeInteraction({ button: { customId: CONSENT_DECLINE_ID } });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);

    const prompt = fake.interaction.reply.mock.calls[0] as unknown as [
      { content: string; components: unknown[]; flags: unknown },
    ];
    expect(prompt[0].content).toContain('LibreTranslate');
    expect(prompt[0].content).toContain('/translate-consent revoke');
    expect(prompt[0].components).toHaveLength(1);
    expect(fake.buttonUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Declined') }),
    );
    expect(translate).not.toHaveBeenCalled();
    expect(store.rows.size).toBe(0);
  });

  it('does not translate when the consent prompt times out', async () => {
    const { deps, translate, store } = makeDeps();
    const fake = fakeInteraction({ button: 'timeout' });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);

    expect(fake.interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({ components: [] }),
    );
    expect(translate).not.toHaveBeenCalled();
    expect(store.rows.size).toBe(0);
  });

  it('ignores button clicks from other users', async () => {
    const { deps, translate } = makeDeps();
    const fake = fakeInteraction({ button: { customId: CONSENT_ACCEPT_ID, userId: 'other' } });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);
    expect(translate).not.toHaveBeenCalled();
  });

  it('stores consent and translates after "agree", with the service footer', async () => {
    const { deps, store, translate } = makeDeps();
    const fake = fakeInteraction({ text: 'Hallo Welt', to: 'en', button: { customId: CONSENT_ACCEPT_ID } });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);

    expect(store.rows.get('user-1')).toBe(TRANSLATION_CONSENT_VERSION);
    expect(translate).toHaveBeenCalledWith('Hallo Welt', 'en');
    const followUp = fake.interaction.followUp.mock.calls[0]?.[0];
    expect(embedOf(followUp).footer?.text).toBe(TRANSLATION_FOOTER);
    expect(embedOf(followUp).fields?.[1]?.value).toBe('[en] Hallo Welt');
  });

  it('translates directly when consent is already stored', async () => {
    const { deps, store, translate } = makeDeps();
    await store.grant('user-1', TRANSLATION_CONSENT_VERSION);
    const fake = fakeInteraction({ hidden: true });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);

    expect(fake.interaction.fetchReply).not.toHaveBeenCalled();
    expect(fake.interaction.deferReply).toHaveBeenCalled();
    expect(translate).toHaveBeenCalledTimes(1);
    const edit = fake.interaction.editReply.mock.calls[0]?.[0];
    expect(embedOf(edit).footer?.text).toBe(TRANSLATION_FOOTER);
  });

  it('asks again when the notice version changed', async () => {
    const { deps, store, translate } = makeDeps();
    store.rows.set('user-1', TRANSLATION_CONSENT_VERSION - 1);
    const fake = fakeInteraction({ button: 'timeout' });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);
    expect(fake.interaction.fetchReply).toHaveBeenCalled();
    expect(translate).not.toHaveBeenCalled();
  });

  it('applies a per-user cooldown', async () => {
    const { deps, store, translate } = makeDeps();
    await store.grant('user-1', TRANSLATION_CONSENT_VERSION);
    const command = createTranslateCommand(deps);

    await command.execute(fakeInteraction().asCommand, {} as never);
    const second = fakeInteraction();
    await command.execute(second.asCommand, {} as never);

    expect(translate).toHaveBeenCalledTimes(1);
    expect(second.interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Please wait') }),
    );
  });

  it('does not translate if consent cannot be read', async () => {
    const failing: TranslationConsentStore = {
      hasConsent: async () => {
        throw new Error('db down');
      },
      grant: async () => undefined,
      revoke: async () => false,
    };
    const { deps, translate } = makeDeps({ consentStore: failing });
    const fake = fakeInteraction();
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);
    expect(translate).not.toHaveBeenCalled();
    expect(fake.interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Nothing was sent') }),
    );
  });

  it('shows a language message for HTTP 400 from the server', async () => {
    const { deps, store } = makeDeps({
      translate: async () => {
        throw new TranslationFailedError('LibreTranslate responded with 400', 400);
      },
    });
    await store.grant('user-1', TRANSLATION_CONSENT_VERSION);
    const fake = fakeInteraction();
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);
    expect(fake.interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('does not support') }),
    );
  });

  it('limits the text option to 1000 characters and uses LibreTranslate codes', () => {
    const { deps } = makeDeps();
    const json = createTranslateCommand(deps).data.toJSON() as {
      options: Array<{ name: string; max_length?: number }>;
    };
    expect(json.options.find((o) => o.name === 'text')?.max_length).toBe(1000);
    expect(LANGUAGE_CHOICES.length).toBeLessThanOrEqual(25);
    const codes = LANGUAGE_CHOICES.map((c) => c.value);
    expect(codes).toContain('zh-Hans');
    expect(codes).not.toContain('zh-CN');
  });
});

describe('/translate-consent', () => {
  it('revoke deletes the stored consent', async () => {
    const store = new MemoryConsentStore();
    await store.grant('user-1', TRANSLATION_CONSENT_VERSION);
    const fake = fakeInteraction({ subcommand: 'revoke' });
    await createTranslateConsentCommand(store).execute(fake.asCommand, {} as never);

    expect(store.rows.has('user-1')).toBe(false);
    expect(fake.interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('withdrawn') }),
    );
  });

  it('after revoke, /translate asks again before sending', async () => {
    const { deps, store, translate } = makeDeps();
    await store.grant('user-1', TRANSLATION_CONSENT_VERSION);
    await createTranslateConsentCommand(store).execute(
      fakeInteraction({ subcommand: 'revoke' }).asCommand,
      {} as never,
    );
    const fake = fakeInteraction({ button: 'timeout' });
    await createTranslateCommand(deps).execute(fake.asCommand, {} as never);
    expect(fake.interaction.fetchReply).toHaveBeenCalled();
    expect(translate).not.toHaveBeenCalled();
  });

  it('status reports the current state', async () => {
    const store = new MemoryConsentStore();
    const fake = fakeInteraction({ subcommand: 'status' });
    await createTranslateConsentCommand(store).execute(fake.asCommand, {} as never);
    expect(fake.interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('not agreed') }),
    );
  });
});

describe('UserCooldown', () => {
  it('expires after the duration', () => {
    let now = 1_000;
    const cooldown = new UserCooldown(5_000, () => now);
    cooldown.start('a');
    expect(cooldown.remaining('a')).toBe(5_000);
    now += 5_000;
    expect(cooldown.remaining('a')).toBe(0);
  });
});
