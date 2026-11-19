# Translation providers and data protection

Preliminary assessment for bot operators. This is not legal advice. Have a lawyer or data protection officer review it before you rely on it.

Status of the research: 2026-11-19. Provider terms change; re-check the linked sources before going live.

## What `/translate` sends

The `/translate` command passes the text entered by the Discord user (option `text`) and the target language to one provider. The provider is chosen in `src/services/translation.service.ts`:

1. `LIBRETRANSLATE_URL` set: LibreTranslate at that URL (`POST <url>/translate`, source language `auto`, optional `LIBRETRANSLATE_API_KEY`).
2. Otherwise `DEEPL_API_KEY` set: DeepL. Keys ending in `:fx` go to `https://api-free.deepl.com/v2/translate` (API Free), all other keys to `https://api.deepl.com/v2/translate` (API Pro).
3. Otherwise the command reports that translation is not configured and nothing is sent.

The request body contains only the text and the language, no Discord user ID or username. The text itself can still contain personal data (names, contact details, sensitive information), because users write it freely. The bot operator is therefore the controller (Art. 4 No. 7 GDPR) for this transfer, and the provider is a recipient or processor.

The bot also shows the original and the translation in an embed in the Discord channel.

## DeepL

Operator: DeepL SE, Maarweg 165, 50825 Cologne, Germany (controller for Germany together with DeepL AI GmbH, DeepL privacy notice, section 1).

### API Free

| Question | Finding |
| --- | --- |
| Data sent | Submitted text and target language, plus the API key. API Free needs a DeepL account. DeepL collects account data (email, IP address) and payment data to prevent misuse (privacy notice, sections 6 and 13). |
| Storage / training | The developer documentation states "no persistent storage, no training" only for paid plans: "With DeepL API paid plans, texts aren't saved on persistent storage and aren't used to train our models." For API Free no such statement was found. The privacy notice (section 13) refers to the free version, and section 3 says content in the free services is kept "for a limited period of time to train and improve our neural networks and algorithms". Read together, this applies to API Free. That is an inference, not an explicit DeepL statement about the API. |
| Personal data | DeepL states that the free services must not be used for texts containing personal data; this is only permitted with a Pro subscription (privacy notice section 3, Free Services terms). Whether this clause also binds API Free users is not stated explicitly. Treat it as binding. |
| Data processing agreement (Art. 28 GDPR) | The privacy notice (section 4) offers the agreement for the Pro services only, on request via privacy@deepl.com. No agreement for API Free was found. Assume none exists. |
| Location / sub-processors | DeepL says document translation runs on its infrastructure in the EEA (section 7.1). For text requests no explicit statement was found. Named recipients on the account and payment side: Stripe (US), Payrails, Riskified (may transfer to the US), Cloudflare (traffic metadata, may use US servers). A transfer mechanism (SCC or EU-US Data Privacy Framework) was not stated in the parts of the notice that were readable. |
| Retention | Full IP addresses of free users up to 14 days (section 9). Retention of API Free texts: not stated. |

Assessment: for texts that contain or may contain personal data, DeepL API Free is not suitable without further clarification. The missing agreement under Art. 28 GDPR, the possible use for training and the DeepL-side restriction on personal data point the same way.

### API Pro

| Question | Finding |
| --- | --- |
| Storage / training | Texts are not stored persistently and not used to train models (developer docs; privacy notice section 4: deleted after the service is delivered). |
| Data processing agreement | Available on request via privacy@deepl.com (privacy notice section 4). Conclude it before production use. |
| Location | See API Free. Request the sub-processor list and the transfer mechanism together with the agreement. |

Technical note: `translation.service.ts` selects the Pro endpoint automatically when the key does not end in `:fx`.

## LibreTranslate

### Self-hosted

LibreTranslate is open source (AGPL-3.0) and translates with Argos Translate, without proprietary services such as Google or Azure (README, project site). With `LIBRETRANSLATE_URL` pointing to your own server, the text does not leave your infrastructure, unless the server runs at a third-party hosting provider. In that case the host is a processor for server operation and needs an agreement under Art. 28 GDPR, and the server location decides about third-country transfers.

Operator duties: use HTTPS (the service accepts `http`, which is only acceptable on a trusted local network), do not log request bodies in a reverse proxy, restrict access, keep the software updated.

### libretranslate.com

| Question | Finding |
| --- | --- |
| Operator | "LibreTranslate". No legal entity is named. The privacy page lists a postal address in St Petersburg, Florida, USA, for the data protection officer. |
| Storage | The privacy page states: "We do not store or log translation texts." IP addresses are kept for 2 days, API keys to prevent misuse. Stripe processes payments when an API key is bought. |
| Data processing agreement | Not mentioned. None found. |
| Location | Operator address in the USA. Server location not stated. Transfer mechanism (DPF, SCC) not stated. |

Assessment: operator in a third country, no named legal entity, no agreement, no transfer mechanism. Not suitable for personal data without further clarification. Other public LibreTranslate instances have the same problem or worse, because their operators are often unknown.

## Discord (briefly)

The texts come from Discord interactions. Discord Inc. (USA) processes them as the platform under its own terms and privacy policy. For the bot operator, Discord's developer terms and policy apply to the data the bot receives. Passing the text of a user's command to a translation provider is a separate transfer that your own privacy notice must cover. This guide does not assess Discord's own compliance.

## Recommendation

1. Prefer self-hosted LibreTranslate on a server in the EU/EEA under your control. This is the only option without a transfer to a third party.
2. If DeepL is needed, use DeepL API Pro with a signed data processing agreement. Do not use API Free for user-generated text.
3. Do not use public LibreTranslate instances (including libretranslate.com) for user text without a written agreement and a check of location and transfer mechanism.
4. Leave the provider variables empty if none of the options is acceptable. The command then stays disabled.
5. Do not log request texts on your side. Keep it that way.

Possible code changes (not part of this guide, for the maintainer to decide):

- Refuse API Free keys (`:fx`) unless an explicit opt-in variable is set.
- Add a notice to the command description and the reply, for example "The text is sent to <provider> for translation." The provider name is available from `getTranslationProvider()`.

## What to put in the bot operator's privacy notice

Cover at least these points (Art. 13 GDPR):

- Purpose: translating the text a user submits with `/translate`.
- Data: the submitted text (may contain personal data) and the target language. Discord identifiers are not sent to the provider.
- Legal basis: Art. 6(1)(b) GDPR if the function is part of the service the user requested; otherwise Art. 6(1)(f) with a documented balancing test. Consent under Art. 6(1)(a) is possible if the command first shows the notice and the user confirms. Which basis fits depends on your setup; a lawyer must check it.
- Recipient: name and address of the provider actually configured (DeepL SE, Cologne, or your own hosting provider).
- Third country: whether a transfer happens and on which mechanism it rests (adequacy decision, SCC, DPF), or that none happens.
- Retention: that the bot does not store the text beyond the request, and what the provider states about its retention.
- Rights: access, rectification, erasure, restriction, objection, complaint to a supervisory authority.
- Processing agreement with the provider (if one is used) and an entry in the record of processing activities (Art. 30 GDPR).

## Sources

All retrieved on 2026-11-19.

- DeepL API documentation, "About": https://developers.deepl.com/docs/getting-started/about.md (paid plans: no persistent storage, no training; endpoints for Free and Pro).
- DeepL privacy notice: https://www.deepl.com/en/privacy (controller, sections 3, 4, 6, 7, 9, 13, 23). The page is long and was read only in part. Check it directly for current wording.
- DeepL Free Services terms: https://www.deepl.com/en/pro-license?tab=free (covers Translator and Write free; API Free is not named).
- LibreTranslate project: https://github.com/LibreTranslate/LibreTranslate and https://libretranslate.com/ (open source, AGPL-3.0, Argos Translate).
- LibreTranslate documentation: https://docs.libretranslate.com/
- LibreTranslate privacy page: https://portal.libretranslate.com/privacy.html
