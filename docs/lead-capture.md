# Lead capture and attribution

How kacper.biz turns visitors into enquiries, and how we know where they came from.
The site stays fully static; the only server code is one Vercel Function, `api/lead.js`.

## Files

| File | Role |
| --- | --- |
| `src/components/ContactForm.astro` | Form markup (PL/EN), RODO Art. 13 notice, honeypot, `[data-after]` booking CTA. Bundles its own script. |
| `src/scripts/lead-form.ts` | Progressive enhancement: validation, JSON POST, success state, `mailto:` fallback. |
| `src/scripts/attribution.ts` | First-touch capture + UTM tagging of outbound links. |
| `api/lead.js` | `POST /api/lead` (validate, bot traps, deliver). `GET` returns 405. |
| `scripts/test-lead.mjs` | Dependency-free test suite for the API. |
| `.env.example` | Every environment variable, documented. |

## Data flow

1. Visitor lands (`?utm_*`, `?ref=`, referrer host) -> `initAttribution()` stores the **first touch** in `sessionStorage['kb_attr']` (tab-lifetime, never a cookie, never sent anywhere by itself).
2. Visitor fills the form. JS stamps a hidden `ts` (render time) and measures `elapsed` with `performance.now()`.
3. Submit -> `POST /api/lead` (JSON, same origin) with the fields, `consent: true`, `hp`, `ts`, `elapsed`, `lang` and the attribution object.
4. The function validates, then tries delivery: **Resend email**, then **webhook** (the webhook is also the fallback if Resend fails).
5. Success -> confirmation, focus moves to the status line, form resets, `[data-after]` (book 30 minutes with Justyna) appears. Nothing configured / delivery failed / network error / timeout -> the form opens a prefilled `mailto:kontakt@fastlanding.io` and also shows it as a link. The form is **not** reset in that case, so nothing typed is lost.

The function keeps nothing: no database, no files. Data exists only in the request, the delivery channel you configure, and your inbox / webhook target.

## Environment variables

All optional; read on every request. See `.env.example` for details.

| Variable | Purpose | Default |
| --- | --- | --- |
| `RESEND_API_KEY` | Enables email delivery via Resend | (off) |
| `LEAD_TO` | Recipient(s), comma-separated | `kontakt@fastlanding.io` |
| `LEAD_FROM` | Sender; must be on a domain verified in Resend | `kacper.biz <onboarding@resend.dev>` (test sender only) |
| `LEAD_REPLY_TO` | `visitor` / empty = visitor's email, `off`, or a fixed address | visitor's email |
| `LEAD_WEBHOOK_URL` | Enables JSON webhook delivery (Zapier, Make, n8n, Slack, CRM) | (off) |
| `LEAD_ALLOW_VERCEL_ORIGINS` | `0` = reject `*.vercel.app` origins | allowed |

With neither `RESEND_API_KEY` nor `LEAD_WEBHOOK_URL`, the API answers `503 {"ok":false,"fallback":"mailto"}` and the site degrades to `mailto:`. Leads are never lost silently, but nothing is captured server-side either.

## What the owner has to do

1. Create a Resend account, add and verify a sending domain (SPF + DKIM DNS records), create a sending-only API key.
2. In Vercel (Production and Preview) set `RESEND_API_KEY` and `LEAD_FROM` (for example `kacper.biz <leads@kacper.biz>`). Optionally `LEAD_TO`. Or set `LEAD_WEBHOOK_URL` instead.
3. Send one real test enquiry from the deployed site and confirm the email arrives (check spam) and that "Reply" goes to the visitor.
4. Make sure `/polityka-prywatnosci` and `/en/privacy` exist (the form links to both) and cover the points under "Privacy" below.
5. Have a lawyer confirm the RODO notice and the privacy page. The notice text is drafted, not legal advice.

The bare `onboarding@resend.dev` test sender only delivers to the Resend account owner's own address. Without a verified `LEAD_FROM`, production sends will fail with a 502 and visitors get the `mailto:` fallback.

## Testing

```sh
node scripts/test-lead.mjs        # 29 cases, no network (fetch is mocked); exits non-zero on failure
```

Covers: valid send (Resend request shape), HTML escaping, subject-line injection, consent, honeypot, too-fast and stale forms, clock-skew tolerance, email/name/need/message/URL validation, Origin and Referer rules, 405, 413, 415, malformed JSON, 503 fallback, webhook, Resend failure and fall-through, rate limit, attribution whitelisting, response headers, and "logs contain no visitor data".

Manual end-to-end: `npx vercel dev` serves the site and `/api/lead` together (put values in `.env`). Plain `npm run dev` (Astro) does **not** run `api/lead.js`; the form will show the `mailto:` fallback there, which is expected.

```sh
curl -i -X POST http://localhost:3000/api/lead -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -d '{"need":"website","name":"Test","email":"t@example.com","consent":true,"hp":"","ts":1,"elapsed":9000}'
```

## API contract

`POST /api/lead`, `Content-Type: application/json`, body max 16 KB. Always JSON, always `Cache-Control: no-store`, `Vary: Origin`.

| Status | Body | Meaning |
| --- | --- | --- |
| 200 | `{ok:true}` | Delivered (or silently dropped as a bot, see below) |
| 400 | `{ok:false,error:'validation',fields:{email:'invalid',...}}` | Field codes: `required`, `too_short`, `too_long`, `invalid` |
| 400 | `error:'stale_form'` | Form open more than 2 h; the client re-stamps and retries once |
| 400 | `error:'invalid_json'` | |
| 403 | `error:'forbidden_origin'` | Origin/Referer not allowed |
| 405 | `Allow: POST` | Any GET |
| 413 / 415 | | Too large / not JSON |
| 429 | `Retry-After` | Rate limited |
| 502 / 503 | `{fallback:'mailto'}` | Delivery failed / nothing configured |

Validation: name 2-100; email valid and at most 254; `need` one of `outreach|website|chatbot|automation|app|other`; website optional, normalised (`acme.pl` becomes `https://acme.pl`), http/https only, no credentials, at most 200; message at most 2000; `consent === true`. Control and bidi characters are stripped everywhere.

## Bot defence (and its limits)

- **Honeypot** `hp` filled, **missing/invalid `ts`**, or **less than 2.5 s** since render -> the API returns a fake `200 {ok:true}` and drops the lead, so bots do not learn what tripped them. The client waits out the 2.6 s minimum silently, so a fast human is never dropped.
- The age is measured by `elapsed` (from `performance.now()`), not only by `ts`, because a visitor's device clock can be wrong by minutes and would otherwise be dropped silently. `ts` (epoch ms) is still required and is the fallback when `elapsed` is absent.
- **Stale** (over 2 h) is answered with a visible 400, not a silent drop, because a human may have left the tab open.
- **Same-origin check**: `kacper.biz`, `www.kacper.biz`, `localhost`/`127.0.0.1`, `*.vercel.app` previews. This blocks other websites posting through a visitor's browser. It does **not** stop curl or scripts, which can forge headers. Anyone can publish a `*.vercel.app` page, so set `LEAD_ALLOW_VERCEL_ORIGINS=0` in production if you do not need previews to submit.
- **Rate limit**: 5 requests per 10 minutes per IP (`x-vercel-forwarded-for`, then `x-real-ip`, then `x-forwarded-for`), held **in memory**. Serverless instances do not share memory and are recycled, so this is only a speed bump; a determined attacker gets around it. The map is capped at 2000 IPs (least recently used evicted) so memory stays bounded.
- None of this is a CAPTCHA. If spam appears, the next steps are Vercel's WAF rate-limit rule on `/api/lead` (shared across instances) and/or Cloudflare Turnstile. Turnstile is a third-party script, so it would need a privacy-page update and a CSP change; it is deliberately not included.
- Delivery is capped at a 9 s total budget; the browser gives up at 12 s. In the rare case the server delivers after the browser has timed out, the visitor sees the `mailto:` fallback and you may receive a duplicate.

## Attribution

Inbound (first touch, per browser tab session): `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ref`, referrer **host only** (external hosts; never a path or query string), landing path. The API whitelists exactly these plus the submit-page path and `lang`; everything else is dropped. They appear in the notification email under "Attribution".

Outbound: every `a[data-outbound]` pointing at `outreachpilot.pl` or `fastlanding.io` (and subdomains; nothing else is ever rewritten) gets:

| Param | Value |
| --- | --- |
| `utm_source` | `kacper.biz` |
| `utm_medium` | `referral` |
| `utm_campaign` | `data-campaign`, else `<lang>-<page>` (`pl-home`, `pl-kontakt`, `en-outreachpilot`) |
| `utm_content` | `data-cta` (for example `hero-outreachpilot`, `after-form-booking`) |

Existing params (such as `?plan=indywidualny`) and `#hash` are kept. Links are re-tagged on `pointerdown` and `focus` too, so dynamic content is covered.

`rel="noopener"` is kept and `noreferrer` is never added: we want the referrer to reach our own product sites. Do **not** add `<meta name="referrer" content="no-referrer">` or a `Referrer-Policy: no-referrer` header on kacper.biz. The default (`strict-origin-when-cross-origin`) sends `https://kacper.biz/` to both product sites.

Whether the product sites' analytics actually read `utm_*` is not verified from this repo. Check that outreachpilot.pl / fastlanding.io record them (and the booking page keeps them).

## Privacy (for the privacy page and the lawyer)

- **Collected via the form**: need, name, email, optional website and message, plus the fact that the notice was acknowledged, the timestamp and the language. Purpose: answering the enquiry and preparing an offer. Basis stated in the notice: Art. 6(1)(b) and (f) GDPR. The checkbox is worded as an acknowledgement ("read the notice") because consent is not the stated basis; there is deliberately **no** marketing opt-in.
- **Attribution data** sent with the form: UTM/ref values, referrer host, landing and submit paths. The visitor's IP is read only for the in-memory rate limiter; it is never logged, delivered or stored by our code.
- **Browser storage**: `sessionStorage['kb_attr']`, first-touch attribution, cleared when the tab closes. No cookies, no third-party scripts, no requests other than our own `/api/lead`. Whether reading and writing this counts as needing consent or a mention under Polish e-privacy rules (Prawo komunikacji elektronicznej) is a **question for the lawyer**. If in doubt, mention it in the privacy page; attribution still works from memory if storage is unavailable.
- **Processors to name in the privacy page**: Vercel (hosting; request logs contain IPs), Resend (email delivery) or whatever the webhook target is. Check each provider's DPA and international-transfer terms.
- **Logs**: the function logs outcome codes only (`delivered`, `dropped reason=...`, `delivery_failed via=... reason=http_422`). The test suite asserts no visitor data reaches the logs.
- **Retention** is whatever the inbox or webhook target keeps; decide a retention period and state it in the privacy page.
- **Have a lawyer confirm the RODO notice** (controller details, purposes, bases, retention, rights, processors) and the privacy page before launch. The notice uses `PERSON.business` from `src/content/site.ts`.

## Wiring notes for pages and layout

- `<ContactForm lang="pl|en" defaultNeed="website" idPrefix="hero" />`. Use a different `idPrefix` for a second instance on the same page.
- Call `initAttribution()` once from the layout (the form component also calls it, so the booking CTA is tagged even if you forget, but other `data-outbound` links need the layout call). Both init functions are idempotent.
- Outbound links to the product sites and the booking page need `data-outbound` and a unique `data-cta`; add `data-campaign` only to override the default.
- If you add a Content-Security-Policy: `connect-src 'self'`, no other origins are needed.
- Routes `/polityka-prywatnosci` and `/en/privacy` must exist.
