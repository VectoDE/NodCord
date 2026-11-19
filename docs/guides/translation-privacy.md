# `/translate` and data protection

Guidance for anyone who deploys NodCord with `/translate` turned on. This is a preliminary assessment, not legal advice. Have a lawyer or data protection officer check the legal classification and your privacy notice before you go live.

Status of the research: 2026-11-19.

## Who is responsible

NodCord is a template. It does not run a bot or a translation server for you. Whoever deploys a bot from it and turns on `/translate` decides on purpose and means of the processing and is the controller under Art. 4 No. 7 GDPR. The maintainers of this repository are not.

## How `/translate` works

- The command only talks to a LibreTranslate server that you run yourself. Configure it with `LIBRETRANSLATE_URL` (and `LIBRETRANSLATE_API_KEY` if your server requires a key). Without `LIBRETRANSLATE_URL` the command is off and nothing is sent.
- The URL is checked when it is read (`src/services/translation.service.ts`). The command refuses to work, logs the reason at startup and tells users it is not configured if:
  - the URL is not `https`. Plain `http` is accepted only for `localhost`, `127.0.0.0/8`, `::1`, private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`) and single-label host names such as the Docker service name `libretranslate`;
  - the URL contains a user name or password;
  - the host is a known public LibreTranslate instance or a subdomain of one (list below), or ends in `.onion` or `.i2p`.
- Before a user's first translation the bot shows an ephemeral notice (only that user sees it) with **Agree and translate** and **Decline**. Nothing is sent before the user agrees. The consent is stored in the table `translation_consent` (Discord user ID, time, notice version). When the notice text changes, the version in `src/services/translationConsent.service.ts` is raised and every user is asked again.
- `/translate-consent revoke` withdraws the consent and deletes the stored entry. `/translate-consent status` shows the current state.
- Every translation reply carries the footer "Translated via this bot's own LibreTranslate server."
- Limits: text up to 1000 characters, server response up to 64 KiB, one translation per user every 10 seconds.

### Blocked public instances

The list is a guard against misconfiguration. It does not detect every public server, and it does not replace your own check of where your server runs.

| Host (subdomains included) | Source |
| --- | --- |
| `libretranslate.com` | Current mirror list, docs.libretranslate.com |
| `translate.cutie.dating` | Current mirror list |
| `translate.fedilab.app` | Current mirror list |
| `*.onion`, `*.i2p` | Current mirror list (Tor/I2P mirrors) |
| `libretranslate.de` | LibreTranslate README, mirror list in tag v1.2.9 |
| `translate.argosopentech.com` | README mirror lists v1.2.9 to v1.5.0 |
| `libretranslate.pussthecat.org` | README v1.2.9 |
| `translate.api.skitzen.com` | README v1.2.9 |
| `translate.fortytwo-it.com` | README v1.2.9 |
| `translate.terraprint.co` | README v1.2.9 to v1.6.0 |
| `translate.foxhaven.cyou` | README v1.3.11, v1.5.0 |
| `libretranslate.eownerdead.dedyn.io` | README v1.5.0, v1.6.0 |
| `trans.zillyhuhn.com` | README v1.5.0, v1.6.0 |

## What is processed

| Data | Where | How long |
| --- | --- | --- |
| Text entered in `/translate` and the target language | Sent to your LibreTranslate server, translation sent back | Not stored by the bot. Your server must not log request bodies (check reverse proxy and LibreTranslate settings). |
| Original and translation | Shown in the Discord channel (or only to the user with `hidden`) | As long as the Discord message exists, under Discord's terms |
| Discord user ID, time of consent, notice version | Bot database, table `translation_consent` | Until the user withdraws (`/translate-consent revoke`) |

The Discord user ID is not sent to the translation server. The text itself can contain personal data, because users type whatever they want.

## Operator checklist

1. Run LibreTranslate on a server you control, located in the EU/EEA. LibreTranslate is open source (AGPL-3.0) and translates with Argos Translate, without proprietary cloud services.
2. If the server runs at a hosting provider, conclude a data processing agreement under Art. 28 GDPR with that provider and check its sub-processors.
3. Use `https` or a private network between bot and server. Restrict access to the server (firewall, API key).
4. Do not log request bodies on the LibreTranslate server or a reverse proxy in front of it.
5. Create the table: this repository has no migration history, the schema is applied with `npm run prisma:push` (`prisma db push`). Run it after updating.
6. Add an entry to your record of processing activities (Art. 30 GDPR): purpose, categories of data, recipients (none besides your own server and hosting provider), retention, technical and organisational measures.
7. Add the text below to your privacy notice and link it where your users can find it (bot profile, server rules, website).
8. When you change the consent notice in the code, raise `TRANSLATION_CONSENT_VERSION`.

## Sample text for your privacy notice

Replace the parts in angle brackets. Have it checked by a lawyer before use.

### Deutsch

> **Übersetzungsfunktion `/translate`**
>
> Wenn Sie den Befehl `/translate` nutzen, wird der von Ihnen eingegebene Text zusammen mit der gewählten Zielsprache an einen Übersetzungsserver übermittelt, den wir selbst betreiben (Software LibreTranslate, Standort: <Land/Rechenzentrum>, Hoster: <Name, Anschrift>, mit dem ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO besteht). Ihre Discord-ID wird dabei nicht übermittelt. Eine Weitergabe an andere Übersetzungsdienste oder sonstige Dritte findet nicht statt.
>
> Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die Sie vor der ersten Übersetzung im Bot erteilen. Sie können die Einwilligung jederzeit mit `/translate-consent revoke` widerrufen. Der Widerruf gilt für die Zukunft; die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt.
>
> Den zu übersetzenden Text speichern wir nicht; er wird nur für die Dauer der Anfrage verarbeitet. Original und Übersetzung erscheinen als Nachricht in Discord und bleiben dort, bis sie gelöscht wird. Gespeichert wird nur, dass Sie eingewilligt haben (Discord-ID, Zeitpunkt, Version des Hinweistexts), und zwar bis zu Ihrem Widerruf.
>
> Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20 DSGVO) sowie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Kontakt: <Verantwortlicher, Anschrift, E-Mail>.

### English

> **Translation command `/translate`**
>
> When you use `/translate`, the text you enter and the chosen target language are sent to a translation server that we operate ourselves (LibreTranslate software, location: <country/data centre>, hosting provider: <name, address>, bound by a data processing agreement under Art. 28 GDPR). Your Discord ID is not sent. The text is not passed on to any other translation service or other third party.
>
> The legal basis is your consent under Art. 6(1)(a) GDPR, which you give in the bot before your first translation. You can withdraw it at any time with `/translate-consent revoke`. Withdrawal applies to the future; processing carried out before it remains lawful.
>
> We do not store the text you want translated; it is processed only for the duration of the request. The original and the translation appear as a Discord message and remain there until deleted. We store only the fact that you consented (Discord ID, time, version of the notice) until you withdraw.
>
> You have the right of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18) and data portability (Art. 20 GDPR), and the right to lodge a complaint with a supervisory authority (Art. 77 GDPR). Contact: <controller, address, email>.

## Open legal points

These need a decision by the operator, ideally with a lawyer:

- Whether consent under Art. 6(1)(a) is the right basis for your setup, or whether Art. 6(1)(b) (part of the service the user requested) fits better. The code implements consent because it is the most cautious option; the sample text assumes it.
- Whether the consent notice in the bot is sufficient under Art. 7 GDPR and Art. 13 GDPR, or whether a link to the full privacy notice must be part of it.
- Discord Inc. (USA) processes the messages as the platform under its own terms. This guide does not assess Discord's own compliance.

## Sources

All retrieved on 2026-11-19.

- LibreTranslate project and README: https://github.com/LibreTranslate/LibreTranslate (open source, AGPL-3.0, Argos Translate).
- LibreTranslate mirror list: https://docs.libretranslate.com/community/mirrors/
- Historic mirror lists in the README at tags v1.2.9, v1.3.11, v1.5.0 and v1.6.0: https://github.com/LibreTranslate/LibreTranslate/blob/v1.2.9/README.md (replace the tag for the others).
- Language codes: `GET /languages` of a LibreTranslate server, API documentation https://docs.libretranslate.com/
- GDPR (Regulation (EU) 2016/679): https://eur-lex.europa.eu/eli/reg/2016/679/oj
