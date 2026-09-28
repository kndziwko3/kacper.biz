/**
 * First-touch attribution + outbound link tagging for kacper.biz.
 *
 *  - Captures utm_* (and `ref`) from the landing URL and the referrer HOST (never the full URL) once per
 *    browser tab session, in sessionStorage under `kb_attr`. No cookies, no third parties, no network.
 *  - Tags every `a[data-outbound]` that points at our own product sites (allow-list below) with
 *    utm_source=kacper.biz&utm_medium=referral&utm_campaign=<data-campaign | "<lang>-<page>">&utm_content=<data-cta>.
 *  - Works without storage (private mode, blocked storage): falls back to in-memory for the current page.
 *
 * `rel="noopener"` is kept and `noreferrer` is never added: we WANT the referrer to reach our own product
 * sites, so their analytics see kacper.biz as the source. (Do not set a `no-referrer` policy in the layout.)
 */

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Value of a `?ref=` parameter, if present at first touch. */
  ref?: string;
  /** Host of document.referrer at first touch (external hosts only, never a path or query). */
  referrer?: string;
  /** Path of the first page seen in this session. */
  landing?: string;
  /** Path of the page being viewed now (where a form is submitted from). */
  page?: string;
  lang: 'pl' | 'en';
}

type FirstTouch = Omit<Attribution, 'page' | 'lang'>;

const STORAGE_KEY = 'kb_attr';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
/** Only these hosts (and their subdomains) are ever rewritten. */
const OUTBOUND_HOSTS = ['outreachpilot.pl', 'fastlanding.io'];
const MAX_VALUE = 100;

let memory: FirstTouch | null = null;
let captured = false;
let initialised = false;

// ── helpers ─────────────────────────────────────────────────────────────────

function clean(value: unknown, max = MAX_VALUE): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim().slice(0, max);
}

const stripWww = (host: string): string => host.toLowerCase().replace(/^www\./, '');

function currentLang(): 'pl' | 'en' {
  const attr = (document.documentElement.lang || '').toLowerCase();
  if (attr) return attr.startsWith('en') ? 'en' : 'pl';
  return /^\/en(\/|$)/.test(location.pathname) ? 'en' : 'pl';
}

function isOwnHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return OUTBOUND_HOSTS.some((own) => h === own || h.endsWith(`.${own}`));
}

function isMeaningful(t: FirstTouch): boolean {
  return UTM_KEYS.some((k) => Boolean(t[k])) || Boolean(t.ref) || Boolean(t.referrer);
}

// ── storage (every access guarded) ──────────────────────────────────────────

function readStored(): FirstTouch | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const src = parsed as Record<string, unknown>;
    const out: FirstTouch = {};
    for (const k of UTM_KEYS) {
      const v = clean(src[k]);
      if (v) out[k] = v;
    }
    const ref = clean(src.ref);
    if (ref) out.ref = ref;
    const referrer = clean(src.referrer);
    if (referrer) out.referrer = referrer;
    const landing = clean(src.landing, 200);
    if (landing) out.landing = landing;
    return out;
  } catch {
    return null;
  }
}

function writeStored(value: FirstTouch): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable: memory copy is enough for this page */
  }
}

// ── capture ─────────────────────────────────────────────────────────────────

function readCurrentTouch(): FirstTouch {
  const touch: FirstTouch = {};
  const params = new URLSearchParams(location.search);
  for (const k of UTM_KEYS) {
    const v = clean(params.get(k));
    if (v) touch[k] = v;
  }
  const ref = clean(params.get('ref'));
  if (ref) touch.ref = ref;
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && stripWww(host) !== stripWww(location.hostname)) touch.referrer = clean(host);
    }
  } catch {
    /* malformed referrer: ignore */
  }
  touch.landing = clean(location.pathname, 200) || '/';
  return touch;
}

/**
 * First touch wins. The one exception: if the stored touch is "empty" (direct visit, nothing to attribute)
 * and this page load carries real attribution (utm_*, ref or an external referrer), that one replaces it.
 */
function captureFirstTouch(): void {
  if (captured) return;
  captured = true;
  const existing = memory ?? readStored();
  const current = readCurrentTouch();
  if (!existing || (!isMeaningful(existing) && isMeaningful(current))) {
    memory = current;
    writeStored(current);
  } else {
    memory = existing;
  }
}

export function getAttribution(): Attribution {
  captureFirstTouch();
  const first = memory ?? {};
  return {
    ...first,
    page: clean(location.pathname, 200) || '/',
    lang: currentLang(),
  };
}

// ── outbound links ──────────────────────────────────────────────────────────

/** "pl-kontakt", "en-outreachpilot", "pl-home" … */
function pageSlug(): string {
  const lang = currentLang();
  const rest = location.pathname.replace(/\/+$/, '').replace(/^\/en(?=\/|$)/, '').replace(/^\/+/, '');
  const slug = (rest || 'home').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'home';
  return `${lang}-${slug}`;
}

function decorate(a: HTMLAnchorElement): void {
  const raw = a.getAttribute('href');
  if (!raw) return;
  let url: URL;
  try {
    url = new URL(raw, location.href);
  } catch {
    return;
  }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !isOwnHost(url.hostname)) return;

  url.searchParams.set('utm_source', 'kacper.biz');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', clean(a.dataset.campaign) || pageSlug());
  const cta = clean(a.dataset.cta);
  if (cta) url.searchParams.set('utm_content', cta);

  const next = url.toString(); // existing params and the #hash are preserved
  if (next !== raw) a.setAttribute('href', next);

  // Keep noopener; deliberately never add noreferrer.
  const rel = new Set((a.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
  if (!rel.has('noopener')) {
    rel.add('noopener');
    a.setAttribute('rel', Array.from(rel).join(' '));
  }
}

function decorateAll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-outbound]').forEach(decorate);
}

function refreshFromEvent(event: Event): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const a = target.closest<HTMLAnchorElement>('a[data-outbound]');
  if (a) decorate(a);
}

export function initAttribution(): void {
  if (initialised) return;
  initialised = true;

  captureFirstTouch();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateAll, { once: true });
  } else {
    decorateAll();
  }

  // Re-tag right before a click/tap/keyboard activation so links added or changed later are covered too.
  document.addEventListener('pointerdown', refreshFromEvent, true);
  document.addEventListener('focusin', refreshFromEvent, true);
}
