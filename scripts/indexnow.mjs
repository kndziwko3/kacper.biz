#!/usr/bin/env node
/**
 * IndexNow submitter for kacper.biz.
 *
 * Tells participating search engines (Bing and, through Bing, the freshness layer behind ChatGPT search and Copilot;
 * also Yandex, Naver, Seznam, Yep) that URLs exist or changed. Google does NOT use IndexNow: for Google use Search
 * Console + the sitemap.
 *
 * SAFE BY DEFAULT: this is a dry run unless you pass --send. Nothing is transmitted otherwise.
 *
 *   node scripts/indexnow.mjs                    dry run, URL list read from dist/sitemap-index.xml (run `astro build` first)
 *   node scripts/indexnow.mjs --live             dry run, URL list fetched from https://kacper.biz/sitemap-index.xml
 *   node scripts/indexnow.mjs --urls /o-mnie,/kontakt   dry run for specific paths or absolute URLs
 *   node scripts/indexnow.mjs --send             really POST to https://api.indexnow.org/indexnow
 *   options: --dist <dir> (default dist)  --host kacper.biz  --skip-key-check
 *
 * The key lives in public/<32 hex>.txt (served at https://kacper.biz/<key>.txt). It is public by design: IndexNow
 * proves ownership by fetching that file, so the key file MUST be deployed and reachable before --send.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};

const HOST = opt('host', 'kacper.biz');
const ORIGIN = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const DIST = path.resolve(ROOT, opt('dist', 'dist'));
const SEND = flag('send');
const LIVE = flag('live');
const MAX_URLS = 10_000; // protocol limit per request
const EXCLUDE = [/^\/lab(\/|$)/, /^\/api(\/|$)/];

const log = (...a) => console.log(...a);
const die = (msg) => {
  console.error(`indexnow: ${msg}`);
  process.exit(1);
};

/* ───────────── key ───────────── */
function findKey() {
  const dirs = [path.join(ROOT, 'public'), DIST];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^([0-9a-f]{32})\.txt$/);
      if (!m) continue;
      const content = fs.readFileSync(path.join(dir, f), 'utf8').trim();
      if (content === m[1]) return m[1];
    }
  }
  return null;
}
const KEY = findKey();
if (!KEY) die('no key file found: expected public/<32 hex chars>.txt containing exactly that key.');
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;

/* ───────────── sitemap ───────────── */
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
const locs = (xml, wrapper) => [...xml.matchAll(new RegExp(`<${wrapper}>\\s*<loc>\\s*([^<]+?)\\s*</loc>`, 'g'))].map((m) => decode(m[1]));

async function readText(source) {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source, { headers: { 'user-agent': 'kacper.biz-indexnow-script' } });
    if (!res.ok) die(`GET ${source} -> HTTP ${res.status}`);
    return res.text();
  }
  if (!fs.existsSync(source)) die(`missing ${source} (run \`npx astro build\` first, or use --live)`);
  return fs.readFileSync(source, 'utf8');
}

/** Map a sitemap <loc> to where it can be read: live URL, or the matching file in dist/. */
const sitemapSource = (loc) => (LIVE ? loc : path.join(DIST, new URL(loc).pathname.replace(/^\//, '')));

async function urlsFromSitemap() {
  const indexSource = LIVE ? `${ORIGIN}/sitemap-index.xml` : path.join(DIST, 'sitemap-index.xml');
  const indexXml = await readText(indexSource);
  const children = indexXml.includes('<sitemapindex') ? locs(indexXml, 'sitemap') : [];
  const urls = [];
  if (children.length === 0) {
    urls.push(...locs(indexXml, 'url'));
  } else {
    for (const child of children) urls.push(...locs(await readText(sitemapSource(child)), 'url'));
  }
  return urls;
}

/* ───────────── build the URL list ───────────── */
function normalise(u) {
  const abs = /^https?:\/\//.test(u) ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
  return new URL(abs);
}

let raw;
const explicit = opt('urls');
if (explicit) raw = explicit.split(',').map((s) => s.trim()).filter(Boolean);
else raw = await urlsFromSitemap();

const urlList = [];
const skipped = [];
for (const item of raw) {
  let u;
  try {
    u = normalise(item);
  } catch {
    skipped.push(`${item} (not a URL)`);
    continue;
  }
  if (u.host !== HOST) skipped.push(`${item} (host is not ${HOST})`);
  else if (EXCLUDE.some((re) => re.test(u.pathname))) skipped.push(`${item} (excluded path)`);
  else urlList.push(u.href);
}
const unique = [...new Set(urlList)].slice(0, MAX_URLS);
if (unique.length === 0) die('no URLs to submit.');

const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: unique };

/* ───────────── report ───────────── */
log(`IndexNow ${SEND ? 'SEND' : 'DRY RUN'}  (${LIVE ? 'live sitemap' : explicit ? '--urls' : 'dist sitemap'})`);
log(`  endpoint    ${ENDPOINT}`);
log(`  host        ${payload.host}`);
log(`  key         ${payload.key}`);
log(`  keyLocation ${payload.keyLocation}`);
log(`  urls        ${unique.length}`);
for (const u of unique) log(`    ${u}`);
if (skipped.length) {
  log(`  skipped     ${skipped.length}`);
  for (const s of skipped) log(`    ${s}`);
}

if (!SEND) {
  log('\nDry run only: nothing was sent. Re-run with --send after the site (including the key file) is deployed.');
  process.exit(0);
}

/* ───────────── send ───────────── */
if (!flag('skip-key-check')) {
  // IndexNow verifies ownership by fetching keyLocation; fail early if it is not live yet.
  let ok = false;
  try {
    const res = await fetch(KEY_LOCATION, { headers: { 'user-agent': 'kacper.biz-indexnow-script' } });
    ok = res.ok && (await res.text()).trim() === KEY;
  } catch {
    ok = false;
  }
  if (!ok) die(`${KEY_LOCATION} is not reachable or does not contain the key. Deploy first (or pass --skip-key-check).`);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
const body = (await res.text()).slice(0, 500);
const meaning = {
  200: 'OK: URLs submitted.',
  202: 'Accepted: URLs received, key validation pending.',
  400: 'Bad request: invalid format.',
  403: 'Forbidden: key not valid (key file missing or not matching).',
  422: 'Unprocessable: URLs do not belong to the host, or the key does not match the schema.',
  429: 'Too many requests: potential spam, slow down.',
}[res.status];
log(`\nHTTP ${res.status} ${res.statusText}${meaning ? ` - ${meaning}` : ''}${body ? `\n${body}` : ''}`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
