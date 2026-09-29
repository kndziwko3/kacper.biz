#!/usr/bin/env node
/**
 * Tests for api/lead.js: no dependencies, no network (global fetch is mocked).
 *
 *   node scripts/test-lead.mjs
 *
 * Prints PASS/FAIL per case and exits non-zero if anything fails.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { POST, GET } = await import(pathToFileURL(path.join(here, '..', 'api', 'lead.js')).href);

// ---------------------------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------------------------

const out = (s) => process.stdout.write(s + '\n');
const realFetch = globalThis.fetch;
const realConsole = { log: console.log, warn: console.warn, error: console.error };

/** Everything the handler logs, so we can assert no PII leaks into logs. */
const loggedLines = [];
for (const k of ['log', 'warn', 'error']) console[k] = (...a) => loggedLines.push(a.map(String).join(' '));

const ENV_KEYS = ['RESEND_API_KEY', 'LEAD_TO', 'LEAD_FROM', 'LEAD_REPLY_TO', 'LEAD_WEBHOOK_URL', 'LEAD_ALLOW_VERCEL_ORIGINS'];
function setEnv(env = {}) {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, env);
}

let fetchCalls = [];
function mockFetch(handler = () => new Response('{"id":"mock"}', { status: 200 })) {
  fetchCalls = [];
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url: String(url), init, body: init && init.body ? JSON.parse(init.body) : null });
    return handler(String(url), init);
  };
}

let ipN = 0;
const nextIp = () => `10.20.${Math.floor(++ipN / 250)}.${(ipN % 250) + 1}`;

const RESEND_ENV = { RESEND_API_KEY: 're_test_key', LEAD_FROM: 'Leads <leads@kacper.biz>' };

function validBody(over = {}) {
  return {
    need: 'website',
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    company: '',
    message: 'Potrzebuję landing page.',
    consent: true,
    hp: '',
    ts: Date.now() - 10_000,
    elapsed: 10_000,
    lang: 'pl',
    attribution: { utm_source: 'newsletter', landing: '/', lang: 'pl' },
    ...over,
  };
}

function req(body, { origin = 'https://kacper.biz', referer, ip = nextIp(), headers = {}, method = 'POST', raw } = {}) {
  const h = { 'content-type': 'application/json', 'x-forwarded-for': ip, ...headers };
  if (origin) h.origin = origin;
  if (referer) h.referer = referer;
  const init = { method, headers: h };
  if (method !== 'GET' && method !== 'HEAD') init.body = raw !== undefined ? raw : JSON.stringify(body);
  return new Request('https://kacper.biz/api/lead', init);
}

async function call(body, opts) {
  const res = await POST(req(body, opts));
  let data = null;
  try {
    data = await res.clone().json();
  } catch {
    /* non-JSON */
  }
  return { res, data };
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// ---------------------------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------------------------

test('valid submission -> 200 and one Resend email (correct shape)', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res, data } = await call(validBody());
  assert.equal(res.status, 200);
  assert.deepEqual(data, { ok: true });
  assert.equal(fetchCalls.length, 1);
  const c = fetchCalls[0];
  assert.equal(c.url, 'https://api.resend.com/emails');
  assert.equal(c.init.method, 'POST');
  assert.equal(c.init.headers.Authorization, 'Bearer re_test_key');
  assert.deepEqual(c.body.to, ['kontakt@fastlanding.io']);
  assert.equal(c.body.from, 'Leads <leads@kacper.biz>');
  assert.equal(c.body.reply_to, 'jan@example.com');
  assert.equal(c.body.subject, '[kacper.biz] Website / landing page: Jan Kowalski');
  assert.match(c.body.text, /Potrzebuję landing page\./);
  assert.match(c.body.text, /utm_source: newsletter/);
  assert.ok(c.body.html.includes('Jan Kowalski'));
});

test('LEAD_TO list, and LEAD_REPLY_TO=off / fixed address', async () => {
  setEnv({ ...RESEND_ENV, LEAD_TO: 'a@x.pl, b@x.pl', LEAD_REPLY_TO: 'off' });
  mockFetch();
  await call(validBody());
  assert.deepEqual(fetchCalls[0].body.to, ['a@x.pl', 'b@x.pl']);
  assert.equal('reply_to' in fetchCalls[0].body, false);

  setEnv({ ...RESEND_ENV, LEAD_REPLY_TO: 'sales@kacper.biz' });
  mockFetch();
  await call(validBody());
  assert.equal(fetchCalls[0].body.reply_to, 'sales@kacper.biz');
});

test('all user content is HTML-escaped in the email', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res } = await call(
    validBody({
      name: '<script>alert(1)</script>',
      message: '<img src=x onerror=alert(1)> & "quotes" \'single\'',
      company: 'https://acme.pl/?a=1&b="><svg onload=x>',
      attribution: { utm_campaign: '"><b>bold</b>', landing: '/', lang: 'pl' },
    }),
  );
  assert.equal(res.status, 200);
  const { html } = fetchCalls[0].body;
  assert.ok(!html.includes('<script'), 'raw <script leaked');
  assert.ok(!html.includes('<img'), 'raw <img leaked');
  assert.ok(!html.includes('<svg'), 'raw <svg leaked');
  assert.ok(!html.includes('"><b>'), 'raw attribute breakout leaked');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quotes&quot; &#39;single&#39;'));
});

test('newlines / control chars in name cannot break the subject line', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res } = await call(validBody({ name: 'Jan\r\nBcc: evil@x.pl\x00\u{202E}' }));
  assert.equal(res.status, 200);
  const { subject } = fetchCalls[0].body;
  assert.ok(!/[\r\n\x00\u{202E}]/u.test(subject), 'subject contains control chars');
});

test('missing consent -> 400 (also consent: "true" string) and nothing delivered', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  let r = await call(validBody({ consent: false }));
  assert.equal(r.res.status, 400);
  assert.equal(r.data.error, 'validation');
  assert.equal(r.data.fields.consent, 'required');
  r = await call(validBody({ consent: 'true' }));
  assert.equal(r.res.status, 400);
  const b = validBody();
  delete b.consent;
  r = await call(b);
  assert.equal(r.res.status, 400);
  assert.equal(fetchCalls.length, 0);
});

test('honeypot filled -> fake 200, NOT delivered', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res, data } = await call(validBody({ hp: 'http://spam.example' }));
  assert.equal(res.status, 200);
  assert.deepEqual(data, { ok: true });
  assert.equal(fetchCalls.length, 0);
});

test('too fast / missing ts -> fake 200, NOT delivered', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  let r = await call(validBody({ ts: Date.now() - 500, elapsed: undefined }));
  assert.equal(r.res.status, 200);
  assert.deepEqual(r.data, { ok: true });
  r = await call(validBody({ ts: Date.now() - 60_000, elapsed: 300 }));
  assert.equal(r.res.status, 200);
  const b = validBody();
  delete b.ts;
  delete b.elapsed;
  r = await call(b);
  assert.equal(r.res.status, 200);
  r = await call(validBody({ ts: 'abc', elapsed: undefined }));
  assert.equal(r.res.status, 200);
  assert.equal(fetchCalls.length, 0);
});

test('a visitor whose clock is wrong is NOT dropped (elapsed wins over ts)', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res } = await call(validBody({ ts: Date.now() + 3_600_000, elapsed: 12_000 }));
  assert.equal(res.status, 200);
  assert.equal(fetchCalls.length, 1);
});

test('form open > 2 h -> 400 stale_form (a human is told, not silently dropped)', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res, data } = await call(validBody({ ts: Date.now() - 3 * 3_600_000, elapsed: undefined }));
  assert.equal(res.status, 400);
  assert.equal(data.error, 'stale_form');
  assert.equal(fetchCalls.length, 0);
});

test('bad email -> 400 with fields.email; good and unusual-but-valid emails pass', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  for (const email of ['nope', 'a@b', 'a b@c.pl', 'x@y..pl', '@x.pl', 'x@.pl', 'x@y.p', '"q"@x.pl', `${'a'.repeat(250)}@x.pl`, '']) {
    const { res, data } = await call(validBody({ email }));
    assert.equal(res.status, 400, `expected 400 for "${email.slice(0, 20)}"`);
    assert.ok(data.fields.email, `expected fields.email for "${email.slice(0, 20)}"`);
  }
  assert.equal(fetchCalls.length, 0);
  for (const email of ['kacper+lead@kacper.biz', 'jan.kowalski@sub.example.co.uk', 'zażółć@gęślą.pl', 'A_B-c@x-y.io']) {
    const { res } = await call(validBody({ email }));
    assert.equal(res.status, 200, `expected 200 for ${email}`);
  }
});

test('other field validation: name, need, message length, company URL', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  let r = await call(validBody({ name: 'J' }));
  assert.equal(r.data.fields.name, 'too_short');
  r = await call(validBody({ name: 'x'.repeat(101) }));
  assert.equal(r.data.fields.name, 'too_long');
  r = await call(validBody({ need: 'crypto' }));
  assert.equal(r.data.fields.need, 'invalid');
  r = await call(validBody({ need: undefined }));
  assert.equal(r.data.fields.need, 'required');
  r = await call(validBody({ message: 'm'.repeat(2001) }));
  assert.equal(r.data.fields.message, 'too_long');
  r = await call(validBody({ company: 'javascript:alert(1)' }));
  assert.equal(r.data.fields.company, 'invalid');
  r = await call(validBody({ company: 'ftp://files.example.com' }));
  assert.equal(r.data.fields.company, 'invalid');
  r = await call(validBody({ company: 'https://user:pw@example.com' }));
  assert.equal(r.data.fields.company, 'invalid');
  r = await call(validBody({ company: 'https://' + 'a'.repeat(200) + '.pl' }));
  assert.equal(r.data.fields.company, 'too_long');
  assert.equal(r.res.status, 400);
  assert.equal(fetchCalls.length, 0);
  // exactly-at-limit values are accepted
  r = await call(validBody({ name: 'xx', message: 'm'.repeat(2000) }));
  assert.equal(r.res.status, 200);
});

test('company URL is normalised (acme.pl -> https://acme.pl)', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const { res } = await call(validBody({ company: '  acme.pl ' }));
  assert.equal(res.status, 200);
  assert.match(fetchCalls[0].body.text, /Website: https:\/\/acme\.pl\n/);
});

test('wrong / missing Origin -> 403', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  for (const origin of [
    'https://evil.example',
    'https://kacper.biz.evil.example',
    'https://evilkacper.biz',
    'https://notvercel.app',
    'https://vercel.app',
    'http://kacper.biz',
    'null',
    'not a url',
  ]) {
    const { res, data } = await call(validBody(), { origin });
    assert.equal(res.status, 403, `expected 403 for Origin ${origin}`);
    assert.equal(data.error, 'forbidden_origin');
  }
  let r = await call(validBody(), { origin: null }); // neither Origin nor Referer
  assert.equal(r.res.status, 403);
  r = await call(validBody(), { origin: 'https://kacper.biz', headers: {} , referer: 'https://evil.example/' });
  assert.equal(r.res.status, 200, 'Origin decides; a bad Referer alongside a good Origin is ignored');
  r = await call(validBody(), { origin: 'https://evil.example', referer: 'https://kacper.biz/kontakt' });
  assert.equal(r.res.status, 403, 'a bad Origin is not rescued by a good Referer');
  assert.equal(fetchCalls.length, 1);
});

test('allowed origins: kacper.biz, www, localhost, vercel.app previews, Referer-only', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  for (const origin of ['https://kacper.biz', 'https://www.kacper.biz', 'http://localhost:4321', 'http://localhost:3000', 'https://kacper-biz-git-x-team.vercel.app']) {
    const { res } = await call(validBody(), { origin });
    assert.equal(res.status, 200, `expected 200 for Origin ${origin}`);
  }
  const { res } = await call(validBody(), { origin: null, referer: 'https://kacper.biz/en/contact' });
  assert.equal(res.status, 200);
});

test('LEAD_ALLOW_VERCEL_ORIGINS=0 disables *.vercel.app', async () => {
  setEnv({ ...RESEND_ENV, LEAD_ALLOW_VERCEL_ORIGINS: '0' });
  mockFetch();
  const { res } = await call(validBody(), { origin: 'https://kacper-biz-abc.vercel.app' });
  assert.equal(res.status, 403);
});

test('GET -> 405 with Allow: POST', async () => {
  const res = GET(new Request('https://kacper.biz/api/lead'));
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'POST');
  assert.equal((await res.json()).ok, false);
});

test('oversize body -> 413 (real size and lying Content-Length)', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  let r = await call(validBody({ message: 'x'.repeat(20_000) }));
  assert.equal(r.res.status, 413);
  r = await call(null, { raw: JSON.stringify(validBody()), headers: { 'content-length': '999999' } });
  assert.equal(r.res.status, 413);
  assert.equal(fetchCalls.length, 0);
});

test('malformed input: bad JSON -> 400, array body -> 400, wrong content-type -> 415', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  let r = await call(null, { raw: '{not json' });
  assert.equal(r.res.status, 400);
  assert.equal(r.data.error, 'invalid_json');
  r = await call(null, { raw: '[1,2,3]' });
  assert.equal(r.res.status, 400);
  r = await call(null, { raw: 'null' });
  assert.equal(r.res.status, 400);
  r = await call(validBody(), { headers: { 'content-type': 'text/plain' } });
  assert.equal(r.res.status, 415);
  r = await call(validBody(), { headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(r.res.status, 415);
  assert.equal(fetchCalls.length, 0);
});

test('nothing configured -> 503 { fallback: "mailto" }', async () => {
  setEnv({});
  mockFetch();
  const { res, data } = await call(validBody());
  assert.equal(res.status, 503);
  assert.equal(data.ok, false);
  assert.equal(data.fallback, 'mailto');
  assert.equal(fetchCalls.length, 0);
});

test('webhook only -> POSTs JSON payload to LEAD_WEBHOOK_URL', async () => {
  setEnv({ LEAD_WEBHOOK_URL: 'https://hooks.example.com/abc' });
  mockFetch();
  const { res } = await call(validBody({ company: 'acme.pl' }));
  assert.equal(res.status, 200);
  assert.equal(fetchCalls.length, 1);
  const c = fetchCalls[0];
  assert.equal(c.url, 'https://hooks.example.com/abc');
  assert.equal(c.init.method, 'POST');
  assert.equal(c.init.headers['Content-Type'], 'application/json');
  assert.equal(c.body.event, 'lead.created');
  assert.equal(c.body.lead.email, 'jan@example.com');
  assert.equal(c.body.lead.company, 'https://acme.pl');
  assert.equal(c.body.lead.need, 'website');
  assert.equal(c.body.lead.consent, true);
  assert.equal(c.body.attribution.utm_source, 'newsletter');
  assert.ok(typeof c.body.received_at === 'string');
});

test('Resend preferred over webhook when both are configured', async () => {
  setEnv({ ...RESEND_ENV, LEAD_WEBHOOK_URL: 'https://hooks.example.com/abc' });
  mockFetch();
  const { res } = await call(validBody());
  assert.equal(res.status, 200);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, 'https://api.resend.com/emails');
});

test('Resend failure: 502 fallback when alone; falls through to webhook when configured', async () => {
  setEnv(RESEND_ENV);
  mockFetch(() => new Response('{"message":"nope"}', { status: 422 }));
  let r = await call(validBody());
  assert.equal(r.res.status, 502);
  assert.equal(r.data.fallback, 'mailto');

  setEnv({ ...RESEND_ENV, LEAD_WEBHOOK_URL: 'https://hooks.example.com/abc' });
  mockFetch((url) => (url.includes('resend') ? new Response('{}', { status: 500 }) : new Response('ok', { status: 200 })));
  r = await call(validBody());
  assert.equal(r.res.status, 200);
  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[1].url, 'https://hooks.example.com/abc');
});

test('network error from the provider -> 502 fallback (no throw)', async () => {
  setEnv(RESEND_ENV);
  mockFetch(() => {
    throw new TypeError('fetch failed');
  });
  const { res, data } = await call(validBody());
  assert.equal(res.status, 502);
  assert.equal(data.fallback, 'mailto');
});

test('rate limit: 6th request from one IP within the window -> 429 + Retry-After', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const ip = '198.51.100.77';
  for (let i = 1; i <= 5; i++) {
    const { res } = await call(validBody(), { ip });
    assert.equal(res.status, 200, `request ${i} should pass`);
  }
  const { res, data } = await call(validBody(), { ip });
  assert.equal(res.status, 429);
  assert.equal(data.error, 'rate_limited');
  assert.ok(Number(res.headers.get('retry-after')) > 0);
  // a different IP is unaffected
  const other = await call(validBody(), { ip: '198.51.100.78' });
  assert.equal(other.res.status, 200);
});

test('attribution is whitelisted, referrer is host-only, control chars stripped', async () => {
  setEnv({ LEAD_WEBHOOK_URL: 'https://hooks.example.com/abc' });
  mockFetch();
  const { res } = await call(
    validBody({
      attribution: {
        utm_source: 'newsletter',
        utm_medium: 'email',
        utm_campaign: 'a\u0000b\nc',
        utm_content: 'x'.repeat(500),
        utm_term: 'cold mailing',
        ref: 'friend',
        evil: 'DROP TABLE',
        __proto__: { polluted: true },
        referrer: 'https://news.ycombinator.com/item?id=1&secret=token',
        landing: '/en/outreachpilot?utm_source=x#frag',
        page: '/kontakt',
        lang: 'en',
      },
    }),
  );
  assert.equal(res.status, 200);
  const a = fetchCalls[0].body.attribution;
  assert.equal(a.utm_source, 'newsletter');
  assert.equal(a.utm_medium, 'email');
  assert.equal(a.utm_campaign, 'ab c');
  assert.equal(a.utm_content.length, 100);
  assert.equal(a.utm_term, 'cold mailing');
  assert.equal(a.ref, 'friend');
  assert.equal(a.referrer, 'news.ycombinator.com');
  assert.equal(a.landing, '/en/outreachpilot');
  assert.equal(a.page, '/kontakt');
  assert.equal(a.lang, 'en');
  assert.equal('evil' in a, false);
  assert.equal('polluted' in a, false);
  assert.ok(!JSON.stringify(fetchCalls[0].body).includes('secret=token'));
});

test('attribution garbage is tolerated (non-object, bad landing/lang)', async () => {
  setEnv({ LEAD_WEBHOOK_URL: 'https://hooks.example.com/abc' });
  mockFetch();
  let r = await call(validBody({ attribution: 'lol' }));
  assert.equal(r.res.status, 200);
  assert.deepEqual(fetchCalls[0].body.attribution, {});
  r = await call(validBody({ attribution: { landing: 'javascript:1', lang: 'de', referrer: 'not a host!!', utm_source: 42 } }));
  assert.equal(r.res.status, 200);
  assert.deepEqual(fetchCalls[1].body.attribution, {});
});

test('lang: body.lang wins, defaults to pl', async () => {
  setEnv({ LEAD_WEBHOOK_URL: 'https://hooks.example.com/abc' });
  mockFetch();
  await call(validBody({ lang: 'en', attribution: {} }));
  await call(validBody({ lang: 'xx', attribution: {} }));
  assert.equal(fetchCalls[0].body.lead.lang, 'en');
  assert.equal(fetchCalls[1].body.lead.lang, 'pl');
});

test('every response is JSON, no-store, Vary: Origin', async () => {
  setEnv(RESEND_ENV);
  mockFetch();
  const responses = [
    (await call(validBody())).res, // 200
    (await call(validBody({ consent: false }))).res, // 400
    (await call(validBody(), { origin: 'https://evil.example' })).res, // 403
    GET(new Request('https://kacper.biz/api/lead')), // 405
    (await call(validBody({ message: 'x'.repeat(20_000) }))).res, // 413
    (await call(validBody({ hp: 'x' }))).res, // dropped 200
  ];
  setEnv({});
  responses.push((await call(validBody())).res); // 503
  assert.deepEqual(
    responses.map((r) => r.status),
    [200, 400, 403, 405, 413, 200, 503],
  );
  for (const r of responses) {
    assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.match(r.headers.get('vary') || '', /Origin/i);
    assert.match(r.headers.get('content-type') || '', /^application\/json/);
  }
});

// Must run last: inspects everything logged during the whole run.
test('logs contain outcome codes only, never visitor data', async () => {
  assert.ok(loggedLines.length > 0, 'expected the handler to log outcomes');
  const joined = loggedLines.join('\n');
  for (const needle of ['jan@example.com', 'Kowalski', 'landing page', 'acme.pl', 'Bcc:', 're_test_key', 'hooks.example.com', 'news.ycombinator']) {
    assert.ok(!joined.includes(needle), `log leaked: ${needle}`);
  }
});

// ---------------------------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------------------------

let failed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    out(`PASS  ${name}`);
  } catch (err) {
    failed++;
    out(`FAIL  ${name}`);
    out('      ' + String(err && err.stack ? err.stack : err).split('\n').slice(0, 6).join('\n      '));
  }
}

globalThis.fetch = realFetch;
Object.assign(console, realConsole);
setEnv({});

out('');
out(failed === 0 ? `All ${tests.length} cases passed.` : `${failed} of ${tests.length} cases FAILED.`);
process.exit(failed === 0 ? 0 : 1);
