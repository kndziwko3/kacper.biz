/**
 * POST /api/lead — kacper.biz lead capture.
 *
 * A Vercel Function in the Web-standard handler style (`export function POST(request) -> Response`).
 * The Astro site itself stays fully static; Vercel serves this file at /api/lead.
 *
 * Flow: same-origin check -> per-IP rate limit -> size/JSON -> bot traps (honeypot, timing)
 *       -> field validation -> delivery (Resend, then webhook) -> JSON response.
 *
 * Privacy: visitor data is only ever held in memory for the duration of the request, sent to the
 * configured delivery channel, and never logged (only outcome codes are logged). See docs/lead-capture.md.
 *
 * Config (all optional, read per request; see .env.example):
 *   RESEND_API_KEY, LEAD_TO, LEAD_FROM, LEAD_REPLY_TO, LEAD_WEBHOOK_URL, LEAD_ALLOW_VERCEL_ORIGINS
 */

// ---------------------------------------------------------------------------------------------
// Limits & constants
// ---------------------------------------------------------------------------------------------

const MAX_BODY_BYTES = 16 * 1024;
const MIN_FORM_AGE_MS = 2500; // faster than this = bot
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000; // older than this = stale form (a human may have left the tab open)
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAP_MAX = 2000;
const DELIVERY_BUDGET_MS = 9000; // total across channels; the browser gives up at 12 s

const DEFAULT_TO = 'kontakt@fastlanding.io';
const DEFAULT_FROM = 'kacper.biz <onboarding@resend.dev>'; // Resend's shared TEST sender; set LEAD_FROM to a verified domain

const NEEDS = {
  outreach: 'Outreach / OutreachPilot',
  website: 'Website / landing page',
  chatbot: 'AI chatbot',
  automation: 'Automation',
  app: 'App / MVP',
  other: 'Other',
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// ---------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------

/** Control chars, bidi overrides/isolates, zero-width space/joiners-that-hide, BOM, line/paragraph separators. Keeps ZWJ/ZWNJ (emoji, some scripts). */
const STRIP_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​‎‏ -‮⁠-⁤⁦-⁩﻿]/g;

/**
 * Coerce to a clean string: NFC, well-formed UTF-16, no control chars.
 * Single-line fields get newlines/tabs collapsed to one space; multiline keeps \n.
 */
function clean(value, { multiline = false } = {}) {
  if (typeof value !== 'string') return '';
  let s = value;
  if (typeof s.toWellFormed === 'function') s = s.toWellFormed();
  s = s.normalize('NFC');
  if (multiline) {
    s = s.replace(/\r\n?/g, '\n').replace(/\t/g, ' ').replace(STRIP_CHARS, '');
  } else {
    s = s.replace(/[\r\n\t]+/g, ' ').replace(STRIP_CHARS, '').replace(/ {2,}/g, ' ');
  }
  return s.trim();
}

/** Length-cap without leaving half of a surrogate pair behind. */
function cap(s, max) {
  if (s.length <= max) return s;
  let out = s.slice(0, max);
  if (/[\uD800-\uDBFF]$/.test(out)) out = out.slice(0, -1);
  return out;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** JSON response. Always no-store, always `Vary: Origin`. */
function json(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

/** Log an outcome code only. Never pass visitor data in here. */
function logOutcome(code, detail = '') {
  console.log(`[lead] ${code}${detail ? ' ' + detail : ''}`);
}

// ---------------------------------------------------------------------------------------------
// Same-origin check
// ---------------------------------------------------------------------------------------------

/**
 * Browsers always send Origin on a cross-origin POST (and on same-origin fetch POSTs). If Origin is
 * absent we fall back to Referer. This stops other websites from posting through a visitor's browser;
 * it does NOT stop curl (anyone can forge headers) — the bot traps and rate limit are for that.
 */
function originAllowed(request) {
  const raw = request.headers.get('origin') ?? request.headers.get('referer');
  if (!raw) return false;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol === 'https:' && (host === 'kacper.biz' || host === 'www.kacper.biz')) return true;
  if ((url.protocol === 'http:' || url.protocol === 'https:') && (host === 'localhost' || host === '127.0.0.1')) return true;
  if (
    url.protocol === 'https:' &&
    host.endsWith('.vercel.app') &&
    host.length > '.vercel.app'.length &&
    process.env.LEAD_ALLOW_VERCEL_ORIGINS !== '0'
  ) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Best-effort rate limit (in-memory; serverless instances do not share memory — a speed bump only)
// ---------------------------------------------------------------------------------------------

const hits = new Map();

function clientIp(request) {
  const h = request.headers;
  const v = h.get('x-vercel-forwarded-for') || h.get('x-real-ip') || (h.get('x-forwarded-for') || '').split(',')[0];
  return cap((v || 'unknown').trim(), 64);
}

/** Returns 0 if allowed, otherwise the number of seconds until the oldest hit expires. */
function rateLimit(ip, now) {
  const cutoff = now - RATE_WINDOW_MS;
  const recent = (hits.get(ip) || []).filter((t) => t > cutoff);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return Math.max(1, Math.ceil((recent[0] + RATE_WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  hits.delete(ip); // re-insert so Map order = least recently used first
  hits.set(ip, recent);
  if (hits.size > RATE_MAP_MAX) {
    // Keep memory bounded: evict least-recently-used IPs first (Map iterates in insertion order).
    for (const key of hits.keys()) {
      if (hits.size <= RATE_MAP_MAX) break;
      hits.delete(key);
    }
  }
  return 0;
}

// ---------------------------------------------------------------------------------------------
// Body reading (hard cap, streaming)
// ---------------------------------------------------------------------------------------------

async function readBody(request, maxBytes) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return { tooLarge: true };
  if (!request.body) return { text: '' };
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      return { tooLarge: true };
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return { text: new TextDecoder('utf-8').decode(all) };
}

// ---------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------

// Pragmatic, unicode-tolerant: local part atext (<=64), dotted domain with a >=2 char TLD, no "..", no quotes/spaces/brackets.
const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[\p{L}\p{N}.!#$%&'*+/=?^_`{|}~-]{1,64}(?<!\.)@(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}\p{N}][\p{L}\p{N}-]{0,61}[\p{L}\p{N}]$/u;

/** Returns { value } (possibly '') or { error }. Accepts "acme.pl" and adds https://. http/https only. */
function normaliseUrl(raw) {
  const s = clean(raw);
  if (!s) return { value: '' };
  if (s.length > 200) return { error: 'too_long' };
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return { error: 'invalid' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { error: 'invalid' };
  if (url.username || url.password) return { error: 'invalid' };
  if (!url.hostname.includes('.')) return { error: 'invalid' };
  let out = url.href;
  if (url.pathname === '/' && !url.search && !url.hash) out = out.replace(/\/$/, '');
  if (out.length > 200) return { error: 'too_long' };
  return { value: out };
}

function cleanPath(raw) {
  const s = clean(raw);
  if (!s.startsWith('/')) return '';
  const path = s.split(/[?#]/)[0];
  return /^\/[^\s]*$/.test(path) ? cap(path, 200) : '';
}

/** Referrer HOST only — never a path or query string. */
function hostOnly(raw) {
  const s = clean(raw).toLowerCase();
  if (!s) return '';
  let host;
  try {
    host = new URL(s.includes('://') ? s : `https://${s}`).hostname;
  } catch {
    return '';
  }
  return /^[a-z0-9.-]{1,100}$/.test(host) ? host : '';
}

function cleanLang(v) {
  return v === 'en' || v === 'pl' ? v : '';
}

/** Whitelist. Anything not listed here is dropped. */
function cleanAttribution(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const out = {};
  for (const key of UTM_KEYS) {
    const v = cap(clean(src[key]), 100);
    if (v) out[key] = v;
  }
  const ref = cap(clean(src.ref), 100);
  if (ref) out.ref = ref;
  const landing = cleanPath(src.landing);
  if (landing) out.landing = landing;
  const page = cleanPath(src.page);
  if (page) out.page = page;
  const referrer = hostOnly(src.referrer);
  if (referrer) out.referrer = referrer;
  const lang = cleanLang(src.lang);
  if (lang) out.lang = lang;
  return out;
}

/** @returns {{ fields: Record<string,string>, lead: object }} `fields` empty when valid. */
function validate(body) {
  const fields = {};

  const name = clean(body.name);
  if (!name) fields.name = 'required';
  else if (name.length < 2) fields.name = 'too_short';
  else if (name.length > 100) fields.name = 'too_long';

  const email = clean(body.email);
  if (!email) fields.email = 'required';
  else if (email.length > 254) fields.email = 'too_long';
  else if (!EMAIL_RE.test(email)) fields.email = 'invalid';

  const need = typeof body.need === 'string' ? body.need : '';
  if (!need) fields.need = 'required';
  else if (!Object.prototype.hasOwnProperty.call(NEEDS, need)) fields.need = 'invalid';

  const site = normaliseUrl(body.company);
  if (site.error) fields.company = site.error;

  const message = clean(body.message, { multiline: true });
  if (message.length > 2000) fields.message = 'too_long';

  if (body.consent !== true) fields.consent = 'required';

  const attribution = cleanAttribution(body.attribution);
  const lang = cleanLang(body.lang) || attribution.lang || 'pl';

  return {
    fields,
    lead: {
      need,
      name,
      email,
      company: site.value || '',
      message,
      lang,
      attribution,
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Bot traps (return a verdict; the caller answers bots with a fake 200)
// ---------------------------------------------------------------------------------------------

/**
 * @returns {'ok' | 'honeypot' | 'no_ts' | 'too_fast' | 'stale'}
 * `elapsed` (ms since render, from performance.now() in the browser) is preferred over `ts` because it is
 * immune to wrong clocks on the visitor's device; `ts` (epoch ms) is the fallback and must always be a number.
 */
function botVerdict(body, now) {
  const hp = body.hp;
  if (hp !== undefined && hp !== null && !(typeof hp === 'string' && hp.trim() === '')) return 'honeypot';
  const ts = Number(body.ts);
  if (!Number.isFinite(ts) || ts <= 0) return 'no_ts';
  const elapsed = typeof body.elapsed === 'number' && Number.isFinite(body.elapsed) ? body.elapsed : null;
  const age = elapsed !== null ? elapsed : now - ts;
  if (age < MIN_FORM_AGE_MS) return 'too_fast';
  if (age > MAX_FORM_AGE_MS) return 'stale';
  return 'ok';
}

// ---------------------------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------------------------

function buildMessages(lead, receivedAt) {
  const needLabel = NEEDS[lead.need];
  const subject = cap(`[kacper.biz] ${needLabel} — ${lead.name}`, 200);
  const a = lead.attribution;

  const rows = [
    ['Need', needLabel],
    ['Name', lead.name],
    ['Email', lead.email],
    ['Website', lead.company || '—'],
    ['Language', lead.lang],
  ];
  const attrRows = [
    ['utm_source', a.utm_source],
    ['utm_medium', a.utm_medium],
    ['utm_campaign', a.utm_campaign],
    ['utm_content', a.utm_content],
    ['utm_term', a.utm_term],
    ['ref', a.ref],
    ['Referrer host', a.referrer],
    ['Landing page', a.landing],
    ['Submitted on', a.page],
  ].filter(([, v]) => v);
  const consentLine = `Data-processing notice acknowledged in the form (lang: ${lead.lang}) at ${receivedAt}`;

  const text = [
    'New enquiry via kacper.biz',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    lead.message || '—',
    '',
    '--- Attribution ---',
    ...(attrRows.length ? attrRows.map(([k, v]) => `${k}: ${v}`) : ['(direct / none captured)']),
    '',
    consentLine,
  ].join('\n');

  const cell = 'padding:4px 12px 4px 0;vertical-align:top;';
  const tr = ([k, v]) =>
    `<tr><td style="${cell}color:#666;white-space:nowrap">${escapeHtml(k)}</td><td style="${cell}">${escapeHtml(v)}</td></tr>`;
  const website = lead.company
    ? `<tr><td style="${cell}color:#666;white-space:nowrap">Website</td><td style="${cell}"><a href="${escapeHtml(lead.company)}">${escapeHtml(lead.company)}</a></td></tr>`
    : tr(['Website', '—']);
  const email = `<tr><td style="${cell}color:#666;white-space:nowrap">Email</td><td style="${cell}"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>`;
  const html = [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#111">',
    '<h2 style="margin:0 0 12px;font-size:18px">New enquiry via kacper.biz</h2>',
    '<table style="border-collapse:collapse">',
    tr(rows[0]),
    tr(rows[1]),
    email,
    website,
    tr(rows[4]),
    '</table>',
    '<h3 style="margin:18px 0 6px;font-size:15px">Message</h3>',
    `<div style="white-space:pre-wrap">${escapeHtml(lead.message || '—')}</div>`,
    '<h3 style="margin:18px 0 6px;font-size:15px">Attribution</h3>',
    attrRows.length
      ? `<table style="border-collapse:collapse">${attrRows.map(tr).join('')}</table>`
      : '<div style="color:#666">(direct / none captured)</div>',
    `<p style="margin:18px 0 0;color:#666;font-size:13px">${escapeHtml(consentLine)}</p>`,
    '</div>',
  ].join('');

  return { subject, text, html };
}

/** LEAD_REPLY_TO: unset/"visitor" -> visitor's email; "off"/"0" -> none; an address -> that address. */
function replyToFor(lead, env) {
  const setting = (env.LEAD_REPLY_TO || 'visitor').trim();
  if (setting === 'off' || setting === '0') return null;
  if (setting !== 'visitor') return setting;
  // Resend rejects non-ASCII addresses in some fields; only use plain ASCII visitor addresses.
  return /^[\x21-\x7e]+$/.test(lead.email) ? lead.email : null;
}

async function sendResend(lead, env, receivedAt, timeoutMs) {
  const { subject, text, html } = buildMessages(lead, receivedAt);
  const to = (env.LEAD_TO || DEFAULT_TO)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const payload = { from: env.LEAD_FROM || DEFAULT_FROM, to, subject, text, html };
  const replyTo = replyToFor(lead, env);
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  try {
    await res.body?.cancel();
  } catch {
    /* ignore */
  }
  if (!res.ok) throw Object.assign(new Error('resend_http'), { code: `http_${res.status}` });
}

async function sendWebhook(lead, env, receivedAt, timeoutMs) {
  const { subject, text } = buildMessages(lead, receivedAt);
  const { attribution, ...fields } = lead;
  const payload = {
    event: 'lead.created',
    site: 'kacper.biz',
    received_at: receivedAt,
    subject,
    text, // convenient for Slack-style incoming webhooks
    lead: { ...fields, need_label: NEEDS[lead.need], consent: true },
    attribution,
  };
  const res = await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  try {
    await res.body?.cancel();
  } catch {
    /* ignore */
  }
  if (!res.ok) throw Object.assign(new Error('webhook_http'), { code: `http_${res.status}` });
}

/** @returns {'sent' | 'unconfigured' | 'failed'} — tries each configured channel in order until one succeeds. */
async function deliver(lead) {
  const env = process.env;
  const channels = [];
  if (env.RESEND_API_KEY) channels.push(['resend', sendResend]);
  if (env.LEAD_WEBHOOK_URL) channels.push(['webhook', sendWebhook]);
  if (channels.length === 0) return 'unconfigured';

  const receivedAt = new Date().toISOString();
  const deadline = Date.now() + DELIVERY_BUDGET_MS;
  for (const [name, send] of channels) {
    const remaining = deadline - Date.now();
    if (remaining < 500) break;
    try {
      await send(lead, env, receivedAt, remaining);
      logOutcome('delivered', `via=${name}`);
      return 'sent';
    } catch (err) {
      // Codes only: never the error message/body (could echo visitor data).
      const code = err && typeof err.code === 'string' ? err.code : err && err.name ? String(err.name) : 'error';
      logOutcome('delivery_failed', `via=${name} reason=${code}`);
    }
  }
  return 'failed';
}

// ---------------------------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------------------------

export function GET() {
  return json(405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' });
}

export async function POST(request) {
  if (!originAllowed(request)) {
    logOutcome('rejected', 'reason=origin');
    return json(403, { ok: false, error: 'forbidden_origin' });
  }

  const now = Date.now();
  const retryAfter = rateLimit(clientIp(request), now);
  if (retryAfter) {
    logOutcome('rejected', 'reason=rate_limited');
    return json(429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(retryAfter) });
  }

  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type', fallback: 'mailto' });
  }

  let raw;
  try {
    raw = await readBody(request, MAX_BODY_BYTES);
  } catch {
    return json(400, { ok: false, error: 'invalid_body' });
  }
  if (raw.tooLarge) {
    logOutcome('rejected', 'reason=too_large');
    return json(413, { ok: false, error: 'payload_too_large' });
  }

  let body;
  try {
    body = JSON.parse(raw.text);
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  // Bots get a fake success so they don't learn what tripped them.
  const verdict = botVerdict(body, now);
  if (verdict === 'honeypot' || verdict === 'no_ts' || verdict === 'too_fast') {
    logOutcome('dropped', `reason=${verdict}`);
    return json(200, { ok: true });
  }
  // A stale form is more likely a human with a long-open tab: tell them, so nothing is silently lost.
  if (verdict === 'stale') {
    return json(400, { ok: false, error: 'stale_form' });
  }

  const { fields, lead } = validate(body);
  if (Object.keys(fields).length > 0) {
    logOutcome('invalid', `fields=${Object.keys(fields).join(',')}`);
    return json(400, { ok: false, error: 'validation', fields });
  }

  const outcome = await deliver(lead);
  if (outcome === 'sent') return json(200, { ok: true });
  if (outcome === 'unconfigured') {
    logOutcome('unconfigured');
    return json(503, { ok: false, error: 'not_configured', fallback: 'mailto' });
  }
  return json(502, { ok: false, error: 'delivery_failed', fallback: 'mailto' });
}
