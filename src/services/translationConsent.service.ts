import prisma from '@/services/prisma.service';

/**
 * Einwilligung für /translate (Art. 6 Abs. 1 lit. a DSGVO).
 *
 * Gespeichert werden nur die Discord-User-ID, der Zeitpunkt und die Version
 * des Hinweistexts. Wird der Hinweistext geändert, CONSENT_VERSION erhöhen:
 * ältere Zustimmungen gelten dann nicht mehr und der Hinweis erscheint erneut.
 */
export const TRANSLATION_CONSENT_VERSION = 1;

export interface TranslationConsentStore {
  hasConsent(discordUserId: string, version: number): Promise<boolean>;
  grant(discordUserId: string, version: number): Promise<void>;
  /** Löscht die Zustimmung. Liefert true, wenn ein Eintrag existierte. */
  revoke(discordUserId: string): Promise<boolean>;
}

interface ConsentRow {
  version?: unknown;
}

export const prismaTranslationConsentStore: TranslationConsentStore = {
  async hasConsent(discordUserId, version) {
    const row = (await prisma.translationConsent.findUnique({
      where: { discordUserId },
      select: { version: true },
    })) as ConsentRow | null | undefined;
    return typeof row?.version === 'number' && row.version >= version;
  },

  async grant(discordUserId, version) {
    await prisma.translationConsent.upsert({
      where: { discordUserId },
      create: { discordUserId, version, consentedAt: new Date() },
      update: { version, consentedAt: new Date() },
    });
  },

  async revoke(discordUserId) {
    const result = (await prisma.translationConsent.deleteMany({
      where: { discordUserId },
    })) as { count?: unknown } | undefined;
    return typeof result?.count === 'number' && result.count > 0;
  },
};

/**
 * Einfache Abklingzeit pro Nutzer (In-Memory, wie bug.general.ts).
 * Abgelaufene Einträge werden beim Zugriff entfernt.
 */
export class UserCooldown {
  private readonly until = new Map<string, number>();

  constructor(
    private readonly durationMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Verbleibende Millisekunden, 0 wenn frei. */
  remaining(userId: string): number {
    const expires = this.until.get(userId);
    if (expires === undefined) return 0;
    const left = expires - this.now();
    if (left <= 0) {
      this.until.delete(userId);
      return 0;
    }
    return left;
  }

  start(userId: string): void {
    this.prune();
    this.until.set(userId, this.now() + this.durationMs);
  }

  private prune(): void {
    const current = this.now();
    for (const [userId, expires] of this.until) {
      if (expires <= current) this.until.delete(userId);
    }
  }
}
