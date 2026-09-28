/**
 * Shared, derived helpers for the SEO / GEO layer (schema.ts, llms.txt, llms-full.txt, facts.json).
 *
 * Everything here is derived from src/content/site.ts (the single source of truth) so the
 * machine-readable surfaces can never drift from the visible copy. Nothing in this file
 * introduces a new fact about Kacper or anyone else.
 */
import {
  SITE,
  PERSON,
  PRODUCTS,
  FASTLANDING_OFFERS,
  type Lang,
} from '../content/site';

/* ───────────────────────── URLs ───────────────────────── */

/** @id of the organisations, deliberately identical to the ids the product sites publish in their own JSON-LD. */
export const ORG_IDS = {
  outreachpilot: 'https://outreachpilot.pl/#organization',
  fastlanding: 'https://fastlanding.io/#organization',
} as const;

/**
 * Normalise a route path: leading slash, no trailing slash (except root), no `.html` / `/index`.
 * astro.config has `trailingSlash: 'never'` + `build.format: 'file'`, so "/" and "/en" are the only shapes that matter.
 */
export function normalizePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/[?#].*$/, '').replace(/\/index(\.html)?$/, '').replace(/\.html$/, '');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/** Absolute URL for a route path. Root keeps its slash ("https://kacper.biz/"), everything else has none. */
export function absUrl(path: string): string {
  const p = normalizePath(path);
  return p === '/' ? `${SITE.url}/` : `${SITE.url}${p}`;
}

/* ───────────────────────── Person / org text ───────────────────────── */

/** sameAs for the Person: LinkedIn + the two author-bio pages on the product sites + anything the owner adds later. */
export function personSameAs(): string[] {
  const all = [PERSON.linkedin, PRODUCTS.outreachpilot.about, PRODUCTS.fastlanding.about, ...PERSON.extraSameAs];
  return [...new Set(all)];
}

/** Short Person description composed only from site.ts (founder role + what the two products are). */
export function personDescription(lang: Lang): string {
  return lang === 'pl'
    ? `${PERSON.jobTitle.pl}. ${PERSON.city}, Polska. OutreachPilot.pl to cold mailing B2B na polskich danych; FastLanding.io to studio: strony internetowe, chatboty AI, automatyzacje i aplikacje MVP.`
    : `${PERSON.jobTitle.en}. ${PERSON.city}, Poland. OutreachPilot.pl is B2B cold outreach on Polish company data; FastLanding.io is a studio for websites, AI chatbots, automations and MVP apps.`;
}

/** The look-alike domains OutreachPilot.pl must not be confused with (from site.ts). */
export function outreachpilotDisambiguation(lang: Lang): string {
  const others = PRODUCTS.outreachpilot.notAffiliatedWith;
  if (lang === 'pl') {
    const list = others.length > 1 ? `${others.slice(0, -1).join(', ')} ani ${others[others.length - 1]}` : others.join('');
    return `Polski produkt z ${PERSON.city}; założyciel: ${PERSON.name}. Nie jest powiązany z ${list}.`;
  }
  const list = others.length > 1 ? `${others.slice(0, -1).join(', ')} or ${others[others.length - 1]}` : others.join('');
  return `Polish product from ${PERSON.city}, Poland; founder: ${PERSON.name}. Not affiliated with ${list}.`;
}

/* ───────────────────────── Offers ───────────────────────── */

export type FastLandingOffer = (typeof FASTLANDING_OFFERS)[number];

export interface ParsedPrice {
  /** First (one-off / starting) amount in PLN, or null if the published string has no parseable number. */
  amount: number | null;
  /** True when the published price is a starting price ("od …" / "from …"). */
  from: boolean;
  /** Recurring monthly amount in PLN (e.g. the FastBot subscription), if the published string has one. */
  monthly: number | null;
}

/** Parse the published PL price string ("od 1 990 zł + 190 zł/mies.") into numbers. The visible string is kept verbatim elsewhere. */
export function parsePrice(published: string): ParsedPrice {
  const nums: number[] = [];
  for (const m of published.matchAll(/(\d[\d\s  ]*?)\s*zł/g)) {
    const digits = (m[1] ?? '').replace(/[\s  ]/g, '');
    if (digits) nums.push(Number(digits));
  }
  const monthly = /\/\s*mies/i.test(published) && nums.length > 1 ? (nums[nums.length - 1] ?? null) : null;
  return { amount: nums[0] ?? null, from: /^\s*od\b/i.test(published), monthly };
}

/* ───────────────────────── Page labels (llms.txt link lists) ───────────────────────── */

/** Human labels for ROUTE_PAIRS, keyed by the PL path. Unknown paths fall back to the path itself. */
export const PAGE_LABELS: Record<string, { pl: string; en: string; note: { pl: string; en: string } }> = {
  '/': {
    pl: 'Strona główna',
    en: 'Home',
    note: { pl: 'kim jest Kacper Rękawek i czym się zajmuje', en: 'who Kacper Rękawek is and what he builds' },
  },
  '/outreachpilot': {
    pl: 'OutreachPilot.pl',
    en: 'OutreachPilot.pl',
    note: { pl: 'produkt: cold mailing B2B na polskich danych', en: 'product: B2B cold outreach on Polish company data' },
  },
  '/fastlanding': {
    pl: 'FastLanding.io',
    en: 'FastLanding.io',
    note: { pl: 'studio: strony, chatboty AI, automatyzacje, MVP', en: 'studio: websites, AI chatbots, automations, MVPs' },
  },
  '/realizacje': {
    pl: 'Realizacje',
    en: 'Work',
    note: { pl: 'projekty klientów zrealizowane przez FastLanding', en: 'client projects delivered by FastLanding' },
  },
  '/o-mnie': {
    pl: 'O mnie',
    en: 'About',
    note: { pl: 'profil, dane firmy, wyjaśnienie tożsamości', en: 'profile, company details, identity disambiguation' },
  },
  '/kontakt': {
    pl: 'Kontakt',
    en: 'Contact',
    note: { pl: 'formularz i dane kontaktowe', en: 'form and contact details' },
  },
  '/polityka-prywatnosci': {
    pl: 'Polityka prywatności',
    en: 'Privacy policy',
    note: { pl: 'informacje o przetwarzaniu danych', en: 'how personal data is processed' },
  },
};

/* ───────────────────────── FAQ (optional, owned by the lead) ───────────────────────── */

export interface FaqItem {
  q: string;
  a: string;
}

/** Strip tags / collapse whitespace so FAQ answers are safe plain text for llms.txt and JSON-LD. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function pickLang(v: unknown, lang: Lang): string | undefined {
  if (typeof v === 'string') return v;
  if (isRecord(v)) {
    const s = v[lang];
    if (typeof s === 'string') return s;
  }
  return undefined;
}

function toFaqItems(v: unknown, lang: Lang): FaqItem[] {
  if (isRecord(v)) return toFaqItems(v[lang], lang); // { pl: [...], en: [...] }
  if (!Array.isArray(v)) return [];
  const out: FaqItem[] = [];
  for (const raw of v as unknown[]) {
    if (!isRecord(raw)) continue;
    const q = pickLang(raw['q'] ?? raw['question'], lang);
    const a = pickLang(raw['a'] ?? raw['answer'], lang);
    if (q && a) out.push({ q: stripHtml(q), a: stripHtml(a) });
  }
  return out;
}

/**
 * src/content/faq.ts is written later by the lead. `import.meta.glob` resolves to `{}` while the file does not
 * exist, so this stays build-safe. Accepted shapes (export name FAQ | FAQS | faq | faqs | default):
 *   - { pl: {q,a}[], en: {q,a}[] }
 *   - {q,a}[] where q / a are strings or { pl, en } objects (keys `question` / `answer` also accepted)
 */
const faqModules = import.meta.glob<Record<string, unknown>>('../content/faq.ts', { eager: true });

export function getFaq(lang: Lang): FaqItem[] {
  const mod = Object.values(faqModules)[0];
  if (!mod) return [];
  for (const name of ['FAQ', 'FAQS', 'faq', 'faqs', 'FAQ_ITEMS', 'default']) {
    const items = toFaqItems(mod[name], lang);
    if (items.length) return items;
  }
  return [];
}
