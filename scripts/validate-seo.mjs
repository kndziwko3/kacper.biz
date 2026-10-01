#!/usr/bin/env node
/**
 * SEO / GEO / AEO validator for the built site. Run after `astro build`:
 *
 *   node scripts/validate-seo.mjs                 validates ./dist
 *   node scripts/validate-seo.mjs --dist path     another build directory
 *   node scripts/validate-seo.mjs --strict        warnings also fail the run
 *   node scripts/validate-seo.mjs --site https://kacper.biz
 *
 * No dependencies. Exit code 1 when there is at least one error (or a warning with --strict).
 *
 * Per HTML page: <title> (<= 65 chars), meta description (110-165), exactly one <h1>, canonical (absolute, self-consistent,
 * no trailing slash except "/"), hreflang (pl-PL + en + x-default, reciprocal), og:image file exists (1200x630), JSON-LD parses
 * and every @id reference resolves inside the page graph, internal <a href>/src/href resolve to files in dist, <img alt>.
 * Site-wide: robots.txt (sitemap URL is a real file, crawlers allowed, /api and /lab disallowed), sitemap lists every indexable
 * page and excludes /lab and /api, llms.txt / llms-full.txt / facts.json / manifest / icons / IndexNow key.
 * Hard rules of this project are enforced too: no GitHub links, no AggregateRating/Review, no streetAddress, exactly one
 * Person node (Kacper), none for anybody else.
 * Also (2026-10-02): every Offer price in JSON-LD must be visible on the page, FAQ Question.url fragments must exist,
 * no em dash (U+2014) in any built text file, no word joiner (U+2060) in titles / meta / JSON-LD, og:locale matches the
 * page language, sitemap <lastmod> on every URL, a raster favicon is declared, and llms.txt H2 sections are link lists.
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

const DIST = path.resolve(process.cwd(), opt('dist', path.join(ROOT, 'dist')));
const SITE = opt('site', 'https://kacper.biz').replace(/\/+$/, '');
const SITE_HOST = new URL(SITE).host;
const STRICT = flag('strict');

const PERSON_ID = `${SITE}/#person`;
const WEBSITE_ID = `${SITE}/#website`;
const REQUIRED_IDS = [PERSON_ID, WEBSITE_ID, 'https://outreachpilot.pl/#organization', 'https://fastlanding.io/#organization'];
/** @id values that may be referenced without being defined in the page graph. */
const KNOWN_EXTERNAL_IDS = new Set(['https://outreachpilot.pl/#organization', 'https://fastlanding.io/#organization']);
const SEARCH_BOTS = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
const FORBIDDEN_LD_TYPES = new Set(['AggregateRating', 'Review', 'Rating']);
const EXCLUDED_PATHS = [/^\/lab(\/|$)/, /^\/api(\/|$)/];

/* ───────────────────────── report plumbing ───────────────────────── */
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = (s) => paint('31', s);
const yellow = (s) => paint('33', s);
const green = (s) => paint('32', s);
const dim = (s) => paint('2', s);
const bold = (s) => paint('1', s);

/** @type {Map<string, {level:'error'|'warn', msg:string}[]>} */
const findings = new Map();
const add = (scope, level, msg) => {
  if (!findings.has(scope)) findings.set(scope, []);
  findings.get(scope).push({ level, msg });
};
const err = (scope, msg) => add(scope, 'error', msg);
const warn = (scope, msg) => add(scope, 'warn', msg);
const len = (s) => [...s].length;
const EM_DASH = '\u2014';
const WORD_JOINER = '\u2060';
/** Visible-text forms of a PLN amount: "1 499 zł", "1499 zł", "PLN 1,499", "PLN 1 499". */
function priceVisible(text, n) {
  const pl = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const en = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^\\d,.])(${esc(pl)}|${esc(String(n))})\\s?zł|PLN\\s?(${esc(en)}|${esc(pl)}|${esc(String(n))})(?![\\d,])`);
  return re.test(text);
}

/* ───────────────────────── tiny HTML toolkit ───────────────────────── */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodeEntities = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

function parseAttrs(str) {
  const out = {};
  const re = /([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(str))) {
    const name = m[1].toLowerCase();
    out[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}
/** All start tags of `name`, as attribute maps. */
function startTags(html, name) {
  const re = new RegExp(`<${name}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>`, 'gi');
  return [...html.matchAll(re)].map((m) => parseAttrs(m[1]));
}
const stripNonContent = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, '');
const visibleText = (html) => decodeEntities(stripNonContent(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/* ───────────────────────── filesystem helpers ───────────────────────── */
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

/** Map a URL pathname to a file in dist (static host semantics: exact file, .html, or dir/index.html). */
function distFileFor(pathname) {
  let p;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    p = pathname;
  }
  const rel = p.replace(/^\/+/, '');
  const candidates = rel === '' ? ['index.html'] : [rel, `${rel}.html`, path.join(rel, 'index.html')];
  for (const c of candidates) {
    const abs = path.join(DIST, c);
    if (abs.startsWith(DIST) && isFile(abs)) return abs;
  }
  return null;
}

/** File path in dist -> canonical route path ("/", "/en", "/o-mnie"). */
function routeForFile(rel) {
  let r = '/' + rel.split(path.sep).join('/');
  r = r.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return r === '' ? '/' : r;
}
const langForRoute = (route) => (route === '/en' || route.startsWith('/en/') ? 'en' : 'pl');
const expectedCanonical = (route) => (route === '/' ? `${SITE}/` : `${SITE}${route}`);

function pngSize(file) {
  try {
    const b = fs.readFileSync(file);
    if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch {
    return null;
  }
}

/* ───────────────────────── load pages ───────────────────────── */
if (!fs.existsSync(DIST)) {
  console.error(`validate-seo: ${DIST} does not exist. Run \`npx astro build\` first (or pass --dist).`);
  process.exit(2);
}
const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
if (htmlFiles.length === 0) {
  console.error(`validate-seo: no .html files in ${DIST}.`);
  process.exit(2);
}

/** @typedef {{route:string, file:string, rel:string, html:string, lang:'pl'|'en', title:string|null, titleCount:number, desc:string|null,
 *   canonicals:string[], robots:string, noindex:boolean, excluded:boolean, is404:boolean, indexable:boolean, metas:Record<string,string>,
 *   hreflangs:Map<string,string>, h1:number, ids:Set<string>, ld:any[], ldErrors:string[], text:string, htmlLang:string|null}} Page */
/** @type {Map<string, Page>} */
const pages = new Map();

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const route = routeForFile(rel);
  const html = fs.readFileSync(file, 'utf8');
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decodeEntities(m[1]).trim());
  const metas = {};
  let robots = '';
  let desc = null;
  for (const a of startTags(html, 'meta')) {
    const key = (a.name ?? a.property ?? '').toLowerCase();
    if (!key) continue;
    if (key === 'description') desc = a.content ?? '';
    else if (key === 'robots') robots = a.content ?? '';
    metas[key] = a.content ?? '';
  }
  const links = startTags(html, 'link');
  const canonicals = links.filter((l) => (l.rel ?? '').toLowerCase().split(/\s+/).includes('canonical')).map((l) => l.href ?? '');
  const hreflangs = new Map();
  for (const l of links) {
    if ((l.rel ?? '').toLowerCase().split(/\s+/).includes('alternate') && l.hreflang) hreflangs.set(l.hreflang, l.href ?? '');
  }
  const body = stripNonContent(html);
  const ids = new Set([...html.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi)].map((m) => m[1] ?? m[2] ?? m[3]));
  const ld = [];
  const ldErrors = [];
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      ld.push(JSON.parse(m[1]));
    } catch (e) {
      ldErrors.push(e.message);
    }
  }
  const htmlTag = startTags(html.slice(0, 2000), 'html')[0];
  const noindex = /noindex/i.test(robots);
  const excluded = EXCLUDED_PATHS.some((re) => re.test(route));
  const is404 = route === '/404';
  pages.set(route, {
    route, file, rel, html, lang: langForRoute(route), title: titles[0] ?? null, titleCount: titles.length, desc, canonicals, robots,
    noindex, excluded, is404, indexable: !noindex && !excluded && !is404, metas, hreflangs,
    h1: (body.match(/<h1\b/gi) ?? []).length, ids, ld, ldErrors, text: visibleText(html), htmlLang: htmlTag?.lang ?? null,
  });
}
const indexable = [...pages.values()].filter((p) => p.indexable);

/** Resolve an absolute URL on this site to a page (by canonical-style route). */
function pageForUrl(u) {
  let url;
  try {
    url = new URL(u);
  } catch {
    return null;
  }
  if (url.host !== SITE_HOST) return null;
  let r = url.pathname;
  if (r.length > 1) r = r.replace(/\/+$/, '');
  return pages.get(r) ?? null;
}

/* ───────────────────────── JSON-LD graph helpers ───────────────────────── */
function analyseGraph(blocks) {
  const defined = new Set();
  const refs = new Set();
  const nodes = [];
  const typeOf = (n) => (Array.isArray(n['@type']) ? n['@type'] : n['@type'] ? [n['@type']] : []);
  const persons = [];
  const forbidden = new Set();
  let hasStreetAddress = false;
  const walkNode = (v) => {
    if (Array.isArray(v)) return v.forEach(walkNode);
    if (typeof v !== 'object' || v === null) return;
    const id = v['@id'];
    if (typeof id === 'string') (Object.keys(v).length === 1 ? refs : defined).add(id);
    for (const t of typeOf(v)) {
      if (FORBIDDEN_LD_TYPES.has(t)) forbidden.add(t);
      if (t === 'Person') persons.push(v);
    }
    if ('streetAddress' in v) hasStreetAddress = true;
    Object.values(v).forEach(walkNode);
  };
  for (const b of blocks) {
    const graph = Array.isArray(b['@graph']) ? b['@graph'] : [b];
    for (const n of graph) nodes.push(n);
    walkNode(b);
  }
  return { defined, refs, nodes, persons, forbidden, hasStreetAddress, typeOf };
}

/* ───────────────────────── per-page checks ───────────────────────── */
const seenTitles = new Map();
const seenDescs = new Map();
const seenCanon = new Map();

function resolveHref(href, route) {
  // returns {kind:'skip'} | {kind:'internal', pathname, hash, absolute} | {kind:'external'}
  const h = href.trim();
  if (h === '' || /^(mailto:|tel:|sms:|javascript:|data:|blob:)/i.test(h)) return { kind: 'skip' };
  let url;
  try {
    url = new URL(h, expectedCanonical(route));
  } catch {
    return { kind: 'bad' };
  }
  if (!/^https?:$/.test(url.protocol)) return { kind: 'skip' };
  if (url.host !== SITE_HOST) return { kind: 'external', url };
  return { kind: 'internal', pathname: url.pathname, hash: url.hash.replace(/^#/, ''), absolute: /^https?:\/\//i.test(h), insecure: url.protocol === 'http:' };
}

for (const page of pages.values()) {
  const S = page.route === '/' ? '/ (index.html)' : page.route;
  const full = page.indexable; // full rule set only for pages meant to rank
  const level = (isFull) => (isFull ? err : warn);

  /* title */
  if (page.titleCount === 0 || !page.title) err(S, '<title> missing or empty');
  else {
    if (page.titleCount > 1) err(S, `${page.titleCount} <title> elements (want 1)`);
    const n = len(page.title);
    if (n > 65) err(S, `<title> is ${n} chars (max 65): "${page.title}"`);
    else if (full && n < 15) warn(S, `<title> is only ${n} chars: "${page.title}"`);
    if (full) {
      const key = norm(page.title);
      if (seenTitles.has(key)) warn(S, `<title> duplicates ${seenTitles.get(key)}`);
      else seenTitles.set(key, page.route);
    }
  }

  /* description */
  if (page.desc === null || page.desc.trim() === '') level(full)(S, 'meta description missing');
  else if (full) {
    const n = len(page.desc);
    if (n < 110 || n > 165) err(S, `meta description is ${n} chars (want 110-165)`);
    const key = norm(page.desc);
    if (seenDescs.has(key)) warn(S, `meta description duplicates ${seenDescs.get(key)}`);
    else seenDescs.set(key, page.route);
  }

  /* h1 */
  if (page.h1 !== 1) level(full)(S, `${page.h1} <h1> elements (want exactly 1)`);

  /* html lang */
  if (!page.htmlLang) err(S, '<html lang> missing');
  else if (full && !page.htmlLang.toLowerCase().startsWith(page.lang)) err(S, `<html lang="${page.htmlLang}"> does not match route language "${page.lang}"`);
  if (!('viewport' in page.metas)) warn(S, 'meta viewport missing');

  /* canonical */
  const want = expectedCanonical(page.route);
  if (page.canonicals.length !== 1) level(full)(S, `${page.canonicals.length} canonical links (want exactly 1)`);
  else {
    const c = page.canonicals[0];
    if (!/^https:\/\//.test(c)) err(S, `canonical is not an absolute https URL: ${c}`);
    else if (c !== want && !page.is404) err(S, `canonical ${c} is not self-consistent (this file is ${want})`);
    if (/[?#]/.test(c)) err(S, `canonical has a query or fragment: ${c}`);
    if (page.indexable) {
      if (seenCanon.has(c)) err(S, `canonical ${c} duplicates ${seenCanon.get(c)}`);
      else seenCanon.set(c, page.route);
    }
  }

  /* robots meta */
  if (full && !/index/i.test(page.robots)) warn(S, 'no robots meta (fine: default is index, follow), but the Seo component normally emits one');

  /* hreflang */
  if (page.hreflangs.size === 0) {
    if (full) warn(S, 'no hreflang alternates');
  } else {
    for (const need of ['pl-PL', 'en', 'x-default']) if (!page.hreflangs.has(need)) err(S, `hreflang "${need}" missing`);
    const pl = page.hreflangs.get('pl-PL');
    const xd = page.hreflangs.get('x-default');
    if (pl && xd && pl !== xd) err(S, 'hreflang x-default must equal the pl-PL URL');
    const reported = new Set();
    const selfKey = page.lang === 'pl' ? 'pl-PL' : 'en';
    if (page.hreflangs.get(selfKey) && page.hreflangs.get(selfKey) !== want) err(S, `hreflang ${selfKey} should be this page (${want}), is ${page.hreflangs.get(selfKey)}`);
    for (const [code, href] of page.hreflangs) {
      if (!/^https:\/\//.test(href)) {
        err(S, `hreflang ${code} is not an absolute https URL: ${href}`);
        continue;
      }
      const target = pageForUrl(href);
      if (!target) {
        err(S, `hreflang ${code} -> ${href} does not exist in dist`);
        continue;
      }
      if (target === page || reported.has(target.route)) continue;
      for (const [c2, h2] of page.hreflangs) {
        if (target.hreflangs.get(c2) !== h2) {
          err(S, `hreflang not reciprocal: ${target.route} lists ${c2}=${target.hreflangs.get(c2) ?? '(none)'}, this page lists ${h2}`);
          reported.add(target.route);
          break;
        }
      }
    }
  }

  /* open graph / twitter */
  if (full) {
    for (const k of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image']) if (!page.metas[k]) err(S, `${k} missing`);
    if (page.metas['og:url'] && page.metas['og:url'] !== want) err(S, `og:url ${page.metas['og:url']} != canonical ${want}`);
    if (!page.metas['twitter:card']) warn(S, 'twitter:card missing');
    if (!page.metas['twitter:image']) warn(S, 'twitter:image missing');
    const img = page.metas['og:image'];
    if (img) {
      if (!/^https:\/\//.test(img)) err(S, `og:image is not an absolute https URL: ${img}`);
      else {
        const u = new URL(img);
        const f = u.host === SITE_HOST ? distFileFor(u.pathname) : null;
        if (u.host !== SITE_HOST) warn(S, `og:image is hosted elsewhere: ${img}`);
        else if (!f) err(S, `og:image file not found in dist: ${u.pathname}`);
        else {
          const size = pngSize(f);
          if (/\.png$/i.test(f) && !size) err(S, `og:image ${u.pathname} is not a valid PNG`);
          else if (size && (size.w !== 1200 || size.h !== 630)) warn(S, `og:image ${u.pathname} is ${size.w}x${size.h} (want 1200x630)`);
          if (size && page.metas['og:image:width'] && (Number(page.metas['og:image:width']) !== size.w || Number(page.metas['og:image:height']) !== size.h)) {
            warn(S, `og:image:width/height meta do not match the file (${size.w}x${size.h})`);
          }
        }
      }
    }
  }

  /* invisible / banned characters in search-result text */
  for (const [k, v] of [['<title>', page.title ?? ''], ...Object.entries(page.metas)]) {
    if (!/^(<title>|description|og:|twitter:)/.test(k)) continue;
    if (v.includes(WORD_JOINER)) err(S, `${k} contains a word joiner (U+2060); strip it from search-result text`);
    if (v.includes(EM_DASH)) err(S, `${k} contains an em dash (U+2014)`);
  }
  if (full && page.metas['og:locale']) {
    const want = page.lang === 'pl' ? 'pl_PL' : 'en_';
    if (!page.metas['og:locale'].startsWith(want)) warn(S, `og:locale ${page.metas['og:locale']} does not match page language ${page.lang}`);
  }

  /* JSON-LD */
  for (const e of page.ldErrors) err(S, `JSON-LD does not parse: ${e}`);
  for (const b of page.ld) {
    const j = JSON.stringify(b);
    if (j.includes(WORD_JOINER) || j.includes('\\u2060')) err(S, 'JSON-LD contains a word joiner (U+2060)');
    if (j.includes(EM_DASH) || j.includes('\\u2014')) err(S, 'JSON-LD contains an em dash (U+2014)');
  }
  if (page.ld.length === 0 && page.ldErrors.length === 0) level(full)(S, 'no JSON-LD block');
  if (page.ld.length > 0) {
    const g = analyseGraph(page.ld);
    for (const ctx of page.ld) if (!/schema\.org/.test(JSON.stringify(ctx['@context'] ?? ''))) err(S, 'JSON-LD @context is not schema.org');
    const dangling = [...g.refs].filter((id) => !g.defined.has(id) && !KNOWN_EXTERNAL_IDS.has(id));
    for (const id of dangling) err(S, `JSON-LD @id reference does not resolve inside the page graph: ${id}`);
    if (full) for (const id of REQUIRED_IDS) if (!g.defined.has(id)) err(S, `JSON-LD graph is missing the node ${id}`);
    for (const t of g.forbidden) err(S, `JSON-LD contains ${t} (self-serving ratings/reviews are not allowed)`);
    if (g.hasStreetAddress) err(S, 'JSON-LD contains streetAddress (city only is published)');
    for (const p of g.persons) {
      if (p['@id'] !== PERSON_ID) err(S, `JSON-LD has a Person node that is not Kacper (${p.name ?? p['@id'] ?? 'unnamed'}); only ${PERSON_ID} is allowed`);
    }
    const person = g.persons.find((p) => p['@id'] === PERSON_ID);
    if (full && person) {
      for (const k of ['name', 'jobTitle', 'disambiguatingDescription', 'sameAs', 'worksFor']) if (!person[k]) warn(S, `Person node has no ${k}`);
      for (const s of [].concat(person.sameAs ?? [])) if (!/^https:\/\//.test(s)) err(S, `Person.sameAs entry is not an absolute https URL: ${s}`);
    }
    if (full) {
      const pageNode = g.nodes.find((n) => n['@id'] === `${want}#webpage`);
      if (!pageNode) err(S, `JSON-LD has no page node with @id ${want}#webpage`);
      else {
        if (pageNode.url !== want) err(S, `page node url ${pageNode.url} != canonical ${want}`);
        if (!pageNode.dateModified) err(S, 'page node has no dateModified');
        if (!pageNode.inLanguage) err(S, 'page node has no inLanguage');
        if (g.typeOf(pageNode).includes('ProfilePage') && (!pageNode.dateCreated || !pageNode.mainEntity)) err(S, 'ProfilePage needs mainEntity and dateCreated');
      }
    }
    for (const n of g.nodes) {
      const types = g.typeOf(n);
      if (types.includes('BreadcrumbList')) {
        for (const it of n.itemListElement ?? []) {
          const target = typeof it.item === 'string' ? pageForUrl(it.item) : null;
          if (!target) err(S, `BreadcrumbList item does not resolve to a page: ${it.item}`);
        }
      }
      if (types.includes('FAQPage')) {
        for (const q of n.mainEntity ?? []) {
          if (q?.name && !page.text.toLowerCase().includes(norm(q.name))) warn(S, `FAQPage question is not visible on the page (markup must match content): "${q.name}"`);
          if (typeof q?.url === 'string') {
            const u = new URL(q.url);
            const frag = decodeURIComponent(u.hash.replace(/^#/, ''));
            if (`${u.origin}${u.pathname}` !== want) err(S, `FAQ Question.url is not on this page: ${q.url}`);
            else if (!frag || !page.ids.has(frag)) err(S, `FAQ Question.url fragment #${frag} has no element with that id on the page`);
          }
        }
      }
    }
    // Every Offer price that is marked up must be visible on the page (Google: markup must match visible content).
    const offers = [];
    const collectOffers = (v) => {
      if (Array.isArray(v)) return v.forEach(collectOffers);
      if (typeof v !== 'object' || v === null) return;
      if (g.typeOf(v).includes('Offer')) offers.push(v);
      Object.values(v).forEach(collectOffers);
    };
    page.ld.forEach(collectOffers);
    for (const o of offers) {
      if (!o.priceCurrency) err(S, `Offer "${o.name ?? '?'}" has no priceCurrency`);
      const amounts = new Set();
      const take = (x) => {
        if (!x || typeof x !== 'object') return;
        for (const k of ['price', 'minPrice']) if (typeof x[k] === 'number') amounts.add(x[k]);
      };
      take(o);
      [].concat(o.priceSpecification ?? []).forEach(take);
      if (amounts.size === 0) err(S, `Offer "${o.name ?? '?'}" has no price, minPrice or priceSpecification`);
      for (const n of amounts) if (!priceVisible(page.text, n)) err(S, `Offer "${o.name ?? '?'}": price ${n} PLN is marked up but not visible on the page`);
    }
  }

  /* links, images, assets */
  const body = stripNonContent(page.html);
  for (const a of startTags(body, 'a')) {
    if (a.href === undefined) continue;
    const r = resolveHref(a.href, page.route);
    if (r.kind === 'bad') err(S, `unparseable href: ${a.href}`);
    if (/github\.com/i.test(a.href)) err(S, `GitHub link is not allowed: ${a.href}`);
    if (r.kind !== 'internal') continue;
    if (r.insecure) warn(S, `internal link uses http: ${a.href}`);
    const file = distFileFor(r.pathname);
    if (!file) err(S, `broken internal link: ${a.href}`);
    else if (r.hash && file.endsWith('.html')) {
      const targetPage = [...pages.values()].find((p) => p.file === file);
      if (targetPage && !targetPage.ids.has(r.hash) && !targetPage.ids.has(decodeURIComponent(r.hash))) warn(S, `link fragment not found on target: ${a.href}`);
    }
  }
  for (const img of startTags(body, 'img')) {
    if (img.alt === undefined) err(S, `<img> without alt attribute: ${img.src ?? '(no src)'}`);
  }
  const assetRefs = [
    ...startTags(body, 'img').map((t) => t.src),
    ...startTags(page.html, 'script').map((t) => t.src),
    ...startTags(page.html, 'link').filter((l) => !/canonical|alternate|me\b|preconnect|dns-prefetch/.test(l.rel ?? '')).map((l) => l.href),
    ...startTags(page.html, 'link').filter((l) => /alternate/.test(l.rel ?? '') && !l.hreflang).map((l) => l.href),
  ].filter(Boolean);
  for (const ref of assetRefs) {
    const r = resolveHref(ref, page.route);
    if (r.kind === 'internal' && !distFileFor(r.pathname)) err(S, `missing asset/file: ${ref}`);
  }
  if (/github\.com/i.test(page.html)) err(S, 'page HTML mentions github.com (no GitHub link anywhere)');
}

/* ───────────────────────── site-wide checks ───────────────────────── */
const SITEWIDE = 'SITE';

/* robots.txt */
const robotsFile = path.join(DIST, 'robots.txt');
/** @type {{agents:string[], rules:{type:string,path:string}[]}[]} */
const groups = [];
let robotsSitemaps = [];
if (!isFile(robotsFile)) err(SITEWIDE, 'robots.txt missing');
else {
  const text = fs.readFileSync(robotsFile, 'utf8');
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase();
    const v = m[2].trim();
    if (k === 'user-agent') {
      if (!cur || cur.rules.length) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(v.toLowerCase());
    } else if (k === 'allow' || k === 'disallow') cur?.rules.push({ type: k, path: v });
    else if (k === 'sitemap') robotsSitemaps.push(v);
  }
  const allowed = (bot, p) => {
    const g = groups.find((x) => x.agents.includes(bot.toLowerCase())) ?? groups.find((x) => x.agents.includes('*'));
    if (!g) return true;
    let best = null;
    for (const r of g.rules) {
      if (r.path === '') continue;
      const re = new RegExp('^' + r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
      if (re.test(p) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.type === 'allow'))) best = r;
    }
    return !best || best.type === 'allow';
  };
  if (robotsSitemaps.length === 0) err(SITEWIDE, 'robots.txt has no Sitemap: line');
  for (const s of robotsSitemaps) {
    let u;
    try {
      u = new URL(s);
    } catch {
      err(SITEWIDE, `robots.txt Sitemap is not a URL: ${s}`);
      continue;
    }
    if (u.host !== SITE_HOST) err(SITEWIDE, `robots.txt Sitemap is on another host: ${s}`);
    else if (!distFileFor(u.pathname)) err(SITEWIDE, `robots.txt references a sitemap that does not exist in dist: ${s}`);
  }
  const probePath = indexable[0]?.route ?? '/';
  for (const bot of [...SEARCH_BOTS, '*']) {
    if (!allowed(bot, '/')) err(SITEWIDE, `robots.txt blocks ${bot} from /`);
    else if (!allowed(bot, probePath)) err(SITEWIDE, `robots.txt blocks ${bot} from ${probePath}`);
    if (allowed(bot, '/api/lead')) err(SITEWIDE, `robots.txt does not disallow /api/ for ${bot}`);
    if (allowed(bot, '/lab')) err(SITEWIDE, `robots.txt does not disallow /lab for ${bot}`);
  }
  for (const bot of SEARCH_BOTS) if (!groups.some((g) => g.agents.includes(bot.toLowerCase()))) warn(SITEWIDE, `robots.txt has no explicit group for ${bot} (allowed via *, listed for clarity elsewhere)`);
}

function readIfEarly(rel) {
  return isFile(path.join(DIST, rel)) ? fs.readFileSync(path.join(DIST, rel), 'utf8') : null;
}

/* sitemap */
const sitemapUrls = [];
const sitemapAlternates = new Map();
const sitemapLastmods = new Set();
{
  const indexFile = path.join(DIST, 'sitemap-index.xml');
  const roots = [];
  if (isFile(indexFile)) {
    const xml = fs.readFileSync(indexFile, 'utf8');
    for (const m of xml.matchAll(/<sitemap>\s*<loc>\s*([^<]+?)\s*<\/loc>/g)) roots.push(decodeEntities(m[1]));
    if (roots.length === 0) err(SITEWIDE, 'sitemap-index.xml lists no sitemaps');
  } else err(SITEWIDE, 'sitemap-index.xml missing in dist');
  for (const loc of roots) {
    const u = new URL(loc);
    const f = u.host === SITE_HOST ? distFileFor(u.pathname) : null;
    if (!f) {
      err(SITEWIDE, `sitemap-index.xml points to a missing file: ${loc}`);
      continue;
    }
    const xml = fs.readFileSync(f, 'utf8');
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const block = m[1];
      const l = block.match(/<loc>\s*([^<]+?)\s*<\/loc>/);
      if (!l) continue;
      const url = decodeEntities(l[1]);
      sitemapUrls.push(url);
      const lm = block.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/);
      if (!lm) warn(SITEWIDE, `sitemap URL has no <lastmod>: ${url}`);
      else if (Number.isNaN(Date.parse(lm[1]))) err(SITEWIDE, `sitemap <lastmod> is not a W3C date: ${lm[1]} (${url})`);
      else if (Date.parse(lm[1]) > Date.now() + 36e5 * 24) err(SITEWIDE, `sitemap <lastmod> is in the future: ${lm[1]} (${url})`);
      else sitemapLastmods.add(lm[1].slice(0, 10));
      const alts = new Map();
      for (const a of block.matchAll(/<xhtml:link\b([^>]*)\/?>/g)) {
        const at = parseAttrs(a[1]);
        if (at.hreflang) alts.set(at.hreflang, at.href);
      }
      sitemapAlternates.set(url, alts);
    }
  }
  const set = new Set(sitemapUrls);
  if (set.size !== sitemapUrls.length) warn(SITEWIDE, 'sitemap contains duplicate URLs');
  for (const url of sitemapUrls) {
    let u;
    try {
      u = new URL(url);
    } catch {
      err(SITEWIDE, `sitemap URL is not absolute: ${url}`);
      continue;
    }
    if (u.host !== SITE_HOST) err(SITEWIDE, `sitemap URL on another host: ${url}`);
    if (EXCLUDED_PATHS.some((re) => re.test(u.pathname))) err(SITEWIDE, `sitemap must not list ${u.pathname}`);
    const p = pageForUrl(url);
    if (!p) err(SITEWIDE, `sitemap URL has no page in dist: ${url}`);
    else if (p.noindex) err(SITEWIDE, `sitemap lists a noindex page: ${url}`);
    else if (expectedCanonical(p.route) !== url) err(SITEWIDE, `sitemap URL ${url} differs from the page canonical ${expectedCanonical(p.route)}`);
  }
  for (const p of indexable) if (!set.has(expectedCanonical(p.route))) err(SITEWIDE, `indexable page missing from sitemap: ${expectedCanonical(p.route)}`);
  // On-page hreflang is authoritative (Google accepts any one method); the sitemap should agree where it has alternates.
  const noAlts = [];
  for (const p of indexable) {
    const alts = sitemapAlternates.get(expectedCanonical(p.route));
    if (p.hreflangs.size === 0) continue;
    if (!alts || alts.size === 0) noAlts.push(p.route);
    else
      for (const [code, href] of alts) if (p.hreflangs.get(code) && p.hreflangs.get(code) !== href) warn(SITEWIDE, `sitemap alternate ${code} for ${p.route} differs from on-page hreflang`);
  }
  if (noAlts.length)
    warn(SITEWIDE, `${noAlts.length} page(s) have on-page hreflang but no xhtml:link alternates in the sitemap (${noAlts.join(', ')}). @astrojs/sitemap only pairs identical slugs; add a serialize() hook in astro.config.mjs that uses ROUTE_PAIRS if you want the sitemap to agree`);
}

/* entity / AI surfaces */
// llms.txt (llmstxt.org): H2 sections hold only "- [label](https://...)" items, no H3+, every URL listed once.
{
  const t = readIfEarly('llms.txt');
  if (t !== null) {
    let section = null;
    const seen = new Set();
    t.split(/\r?\n/).forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return;
      if (/^###/.test(line)) return err(SITEWIDE, `llms.txt line ${i + 1}: only H1 and H2 headings are allowed`);
      if (/^##\s/.test(line)) return void (section = line);
      if (!section) return;
      const m = line.match(/^-\s+\[([^\]]+)]\((https:\/\/[^\s)]+)\)(?::\s*(.*))?$/);
      if (!m) return err(SITEWIDE, `llms.txt line ${i + 1}: lines under an H2 must be "- [label](https://...)" link items`);
      if (seen.has(m[2].toLowerCase())) err(SITEWIDE, `llms.txt line ${i + 1}: URL listed twice: ${m[2]}`);
      seen.add(m[2].toLowerCase());
    });
  }
}
const readIf = readIfEarly;
for (const f of ['llms.txt', 'llms-full.txt']) {
  const t = readIf(f);
  if (t === null) err(SITEWIDE, `${f} missing`);
  else {
    if (!t.startsWith('# ')) err(SITEWIDE, `${f} should start with an H1 ("# Title")`);
    if (t.length < 400) warn(SITEWIDE, `${f} is very short (${t.length} chars)`);
    if (/github\.com/i.test(t)) err(SITEWIDE, `${f} mentions github.com`);
    if (!/\d{4}-\d{2}-\d{2}/.test(t)) warn(SITEWIDE, `${f} has no dated statement`);
  }
}
{
  const t = readIf('facts.json');
  if (t === null) err(SITEWIDE, 'facts.json missing');
  else {
    try {
      const j = JSON.parse(t);
      if (j?.person?.id !== PERSON_ID) err(SITEWIDE, `facts.json person.id is not ${PERSON_ID}`);
      if (!j?.site?.lastModified) err(SITEWIDE, 'facts.json has no site.lastModified');
      if (/github\.com/i.test(t)) err(SITEWIDE, 'facts.json mentions github.com');
      if (/streetAddress/i.test(t)) err(SITEWIDE, 'facts.json contains a street address field');
    } catch (e) {
      err(SITEWIDE, `facts.json does not parse: ${e.message}`);
    }
  }
}
for (const f of ['favicon.svg', 'apple-touch-icon.png', 'site.webmanifest']) if (!isFile(path.join(DIST, f))) err(SITEWIDE, `${f} missing in dist`);
{
  const s = pngSize(path.join(DIST, 'apple-touch-icon.png'));
  if (s && (s.w !== 180 || s.h !== 180)) warn(SITEWIDE, `apple-touch-icon.png is ${s.w}x${s.h} (want 180x180)`);
  const t = readIf('site.webmanifest');
  if (t) {
    try {
      const m = JSON.parse(t);
      for (const k of ['name', 'short_name', 'theme_color', 'background_color', 'icons']) if (!m[k]) err(SITEWIDE, `site.webmanifest has no ${k}`);
      for (const ic of m.icons ?? []) {
        const u = new URL(ic.src, SITE);
        if (!distFileFor(u.pathname)) err(SITEWIDE, `site.webmanifest icon missing in dist: ${ic.src}`);
      }
    } catch (e) {
      err(SITEWIDE, `site.webmanifest does not parse: ${e.message}`);
    }
  }
}
{
  const keyFiles = allFiles.filter((f) => /^[0-9a-f]{32}\.txt$/.test(path.basename(f)));
  if (keyFiles.length === 0) warn(SITEWIDE, 'no IndexNow key file (<32 hex>.txt) in dist');
  for (const f of keyFiles) if (fs.readFileSync(f, 'utf8').trim() !== path.basename(f, '.txt')) err(SITEWIDE, `IndexNow key file ${path.basename(f)} does not contain its own name as the key`);
}
if (!pages.has('/404')) warn(SITEWIDE, '404.html missing');

/* sitemap lastmod agrees with facts.json site.lastModified (both come from SITE.lastModified) */
{
  try {
    const lm = JSON.parse(readIf('facts.json') ?? '{}')?.site?.lastModified;
    if (lm && sitemapLastmods.size && !(sitemapLastmods.size === 1 && sitemapLastmods.has(lm)))
      warn(SITEWIDE, `sitemap <lastmod> dates (${[...sitemapLastmods].join(', ')}) differ from facts.json site.lastModified (${lm})`);
  } catch {
    /* facts.json errors are reported above */
  }
}

/* favicon: the home page declares an icon, and at least one raster icon is a square multiple of 48 px */
{
  const home = pages.get('/');
  if (home) {
    const icons = startTags(home.html, 'link').filter((l) => (l.rel ?? '').toLowerCase().split(/\s+/).includes('icon'));
    if (icons.length === 0) err(SITEWIDE, 'home page declares no <link rel="icon">');
    const rasterOk = icons.some((l) => {
      const f = l.href ? distFileFor(new URL(l.href, SITE).pathname) : null;
      const sz = f ? pngSize(f) : null;
      return sz && sz.w === sz.h && sz.w % 48 === 0;
    });
    // /favicon.ico is only a fallback for clients that ignore <link rel="icon">; required only when no raster icon is declared.
    if (icons.length && !rasterOk && !isFile(path.join(DIST, 'favicon.ico')))
      warn(SITEWIDE, 'no raster favicon declared (PNG, square, multiple of 48 px) and no /favicon.ico; Bing and older Safari ignore SVG icons');
  }
}

/* em dash (U+2014) anywhere in built text output (owner rule) */
for (const f of allFiles.filter((x) => /\.(html|txt|json|xml|webmanifest)$/.test(x))) {
  const t = fs.readFileSync(f, 'utf8');
  const i = t.indexOf(EM_DASH);
  if (i >= 0) err(SITEWIDE, `em dash (U+2014) in ${path.relative(DIST, f)}: "...${t.slice(Math.max(0, i - 40), i + 20).replace(/\s+/g, ' ')}..."`);
}

/* ───────────────────────── output ───────────────────────── */
const scopes = [...new Set([...[...pages.values()].map((p) => (p.route === '/' ? '/ (index.html)' : p.route)), SITEWIDE])];
let errors = 0;
let warnings = 0;
console.log(bold(`SEO validation for ${SITE}`));
console.log(dim(`dist: ${DIST}  |  ${pages.size} HTML pages, ${indexable.length} indexable, ${sitemapUrls.length} sitemap URLs\n`));
for (const scope of scopes) {
  const list = findings.get(scope) ?? [];
  const e = list.filter((f) => f.level === 'error');
  const w = list.filter((f) => f.level === 'warn');
  errors += e.length;
  warnings += w.length;
  const tag = e.length ? red('FAIL') : w.length ? yellow('WARN') : green('OK  ');
  const p = [...pages.values()].find((x) => (x.route === '/' ? '/ (index.html)' : x.route) === scope);
  const note = p ? (p.indexable ? '' : dim(p.is404 ? '  (404, not indexed)' : p.excluded ? '  (excluded: /lab or /api)' : '  (noindex)')) : '';
  console.log(`${tag} ${scope}${note}`);
  for (const f of e) console.log(`     ${red('error')} ${f.msg}`);
  for (const f of w) console.log(`     ${yellow('warn ')} ${f.msg}`);
}
console.log('');
console.log(`${errors === 0 ? green('PASS') : red('FAIL')}  ${errors} error(s), ${warnings} warning(s)${STRICT && warnings ? ' (warnings are errors with --strict)' : ''}`);
process.exit(errors > 0 || (STRICT && warnings > 0) ? 1 : 0);
