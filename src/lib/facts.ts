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
  PROJECTS,
  PROOF,
  SALES,
  CONTACT,
  FASTLANDING_OFFERS,
  FASTLANDING_RECURRING,
  OUTREACHPILOT_PLANS,
  PRICES_CHECKED,
  BENCHMARK,
  LEGAL_NOTE,
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

/** Polish genitive of PERSON.city ("z Gliwic"). Keep in sync with PERSON.city; the copy in site.ts also says "z Gliwic". */
export const CITY_GENITIVE_PL = 'Gliwic';

/** Localise a published proof value for the EN surfaces ("20 418" -> "20,418", "7 dni" -> "7 days"). PL stays verbatim. */
export function localizeValue(value: string, lang: Lang): string {
  if (lang === 'pl') return value;
  // lookahead, so every thousands group is converted ("3 181 616" -> "3,181,616", not "3,181 616")
  return value.replace(/(\d)[\s\u00a0\u202f](?=\d{3}(?!\d))/g, '$1,').replace(/\bdni\b/g, 'days');
}

/** The look-alike domains OutreachPilot.pl must not be confused with (from site.ts). */
export function outreachpilotDisambiguation(lang: Lang): string {
  const others = PRODUCTS.outreachpilot.notAffiliatedWith;
  if (lang === 'pl') {
    const list = others.length > 1 ? `${others.slice(0, -1).join(', ')} ani ${others[others.length - 1]}` : others.join('');
    return `Polski produkt z ${CITY_GENITIVE_PL}; założyciel: ${PERSON.name}. Nie jest powiązany z ${list}.`;
  }
  const list = others.length > 1 ? `${others.slice(0, -1).join(', ')} or ${others[others.length - 1]}` : others.join('');
  return `Polish product from ${PERSON.city}, Poland; founder: ${PERSON.name}. Not affiliated with ${list}.`;
}

/** The look-alike domains FastLanding.io must not be confused with (from site.ts). */
export function fastlandingDisambiguation(lang: Lang): string {
  const others = PRODUCTS.fastlanding.notAffiliatedWith;
  const list = (sep: string) => (others.length > 1 ? `${others.slice(0, -1).join(', ')} ${sep} ${others[others.length - 1]}` : others.join(''));
  return lang === 'pl'
    ? `Studio z ${CITY_GENITIVE_PL}; założyciel: ${PERSON.name}. Nie jest powiązane z ${list('ani')} (generatory landing page innych firm).`
    : `Studio from ${PERSON.city}, Poland; founder: ${PERSON.name}. Not affiliated with ${list('or')} (other companies' AI landing-page builders).`;
}

/* ───────────────────────── Offers ───────────────────────── */

export type FastLandingOffer = (typeof FASTLANDING_OFFERS)[number];

export interface ParsedPrice {
  /** First (one-off / starting) amount in PLN, or null if the published string has no parseable number. */
  amount: number | null;
  /** True when the published price is a starting price ("od …" / "from …"). */
  from: boolean;
  /** Recurring monthly amount in PLN on top of a one-off amount (e.g. the FastBot subscription "+ 190 zł/mies."). */
  monthly: number | null;
  /** True when the only amount is itself a monthly price ("690 zł/mies.", "od 1 490 zł/mies."). */
  perMonth: boolean;
}

/** Parse the published PL price string ("od 1 990 zł + 190 zł/mies.") into numbers. The visible string is kept verbatim elsewhere. */
export function parsePrice(published: string): ParsedPrice {
  const nums: number[] = [];
  for (const m of published.matchAll(/(\d[\d\s  ]*?)\s*zł/g)) {
    const digits = (m[1] ?? '').replace(/[\s  ]/g, '');
    if (digits) nums.push(Number(digits));
  }
  const hasMonth = /\/\s*mies/i.test(published);
  const monthly = hasMonth && nums.length > 1 ? (nums[nums.length - 1] ?? null) : null;
  return { amount: nums[0] ?? null, from: /^\s*od\b/i.test(published), monthly, perMonth: hasMonth && nums.length === 1 };
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

/**
 * Stable fragment id for a FAQ question ("Kim jest Kacper Rękawek?" -> "faq-kim-jest-kacper-rekawek"), shared by the
 * visible FAQ (Faq.astro) and FAQPage markup (Question.url), so an answer can be linked and cited directly.
 * Works on raw copy (with no-break spaces / word joiners) and on stripped text alike.
 */
export function faqAnchor(question: string): string {
  const ascii = question
    .replace(/<[^>]+>/g, '')
    .replace(/[łŁ]/g, (c) => (c === 'ł' ? 'l' : 'L'))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `faq-${ascii.slice(0, 64).replace(/-+$/, '')}`;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Strip tags / collapse whitespace so FAQ answers are safe plain text for llms.txt and JSON-LD. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\u2060/g, '')
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
 * The visible FAQ is owned by the lead. Two locations are supported, both resolved with `import.meta.glob` so a missing
 * file simply yields `{}` and the build never breaks:
 *   1. src/content/faq.ts   - export FAQ | FAQS | faq | faqs | default, as { pl: {q,a}[], en: {q,a}[] } or {q,a}[] with
 *                             q / a either strings or { pl, en } objects (keys `question` / `answer` also accepted)
 *   2. src/content/copy.ts  - `copy[lang].faq` (what the pages use today)
 */
const faqModules = import.meta.glob<Record<string, unknown>>('../content/faq.ts', { eager: true });
const copyModules = import.meta.glob<Record<string, unknown>>('../content/copy.ts', { eager: true });

export function getFaq(lang: Lang): FaqItem[] {
  const dedicated = Object.values(faqModules)[0];
  if (dedicated) {
    for (const name of ['FAQ', 'FAQS', 'faq', 'faqs', 'FAQ_ITEMS', 'default']) {
      const items = toFaqItems(dedicated[name], lang);
      if (items.length) return items;
    }
  }
  const copyMod = Object.values(copyModules)[0];
  const copy = copyMod?.['copy'];
  if (isRecord(copy)) {
    const langCopy = copy[lang];
    if (isRecord(langCopy)) return toFaqItems(langCopy['faq'], lang);
  }
  return [];
}

/* ───────────────────────── facts.json ───────────────────────── */

/**
 * Machine-readable entity facts (served at /facts.json). Every value comes from site.ts, so it can only change
 * when the visible site changes. `source` URLs point at the pages where each fact is published.
 */
export function buildFactsDocument(): Record<string, unknown> {
  const both = <T>(pl: T, en: T) => ({ pl, en });

  return {
    schemaVersion: 2,
    site: {
      url: SITE.url,
      name: SITE.name,
      languages: [SITE.locale.pl, SITE.locale.en],
      defaultLanguage: SITE.locale.pl,
      entityHome: `${SITE.url}/`,
      lastModified: SITE.lastModified,
      note: 'Generated at build time from the same data as the visible pages. If this file and a product site disagree, the product site is authoritative.',
      llmsTxt: `${SITE.url}/llms.txt`,
      llmsFullTxt: `${SITE.url}/llms-full.txt`,
    },
    person: {
      id: PERSON.id,
      name: PERSON.name,
      givenName: PERSON.givenName,
      familyName: PERSON.familyName,
      alternateName: [...PERSON.alternateName],
      jobTitle: both(PERSON.jobTitle.pl, PERSON.jobTitle.en),
      location: { city: PERSON.city, region: PERSON.region, country: PERSON.country },
      languages: ['pl', 'en'],
      knowsAbout: both([...PERSON.knowsAbout.pl], [...PERSON.knowsAbout.en]),
      sameAs: personSameAs(),
      disambiguation: both(PERSON.disambiguation.pl, PERSON.disambiguation.en),
      notTheSamePersonAs: 'A Kacper Rękawek who is an international-security researcher',
    },
    organizations: [
      {
        id: ORG_IDS.outreachpilot,
        name: PRODUCTS.outreachpilot.name,
        url: PRODUCTS.outreachpilot.url,
        founder: PERSON.id,
        description: both(PRODUCTS.outreachpilot.tagline.pl, PRODUCTS.outreachpilot.tagline.en),
        notAffiliatedWith: [...PRODUCTS.outreachpilot.notAffiliatedWith],
        registry: { nip: PERSON.business.nip, regon: PERSON.business.regon },
        location: { city: PERSON.city, country: PERSON.country },
        sources: [PRODUCTS.outreachpilot.about, PRODUCTS.outreachpilot.url],
      },
      {
        id: ORG_IDS.fastlanding,
        name: PRODUCTS.fastlanding.name,
        legalName: PERSON.business.legalName,
        url: PRODUCTS.fastlanding.url,
        founder: PERSON.id,
        description: both(PRODUCTS.fastlanding.tagline.pl, PRODUCTS.fastlanding.tagline.en),
        notAffiliatedWith: [...PRODUCTS.fastlanding.notAffiliatedWith],
        registry: { nip: PERSON.business.nip, regon: PERSON.business.regon },
        location: { city: PERSON.city, country: PERSON.country },
        areaServed: 'PL',
        sources: [PRODUCTS.fastlanding.about, PRODUCTS.fastlanding.url],
      },
    ],
    products: {
      outreachpilot: {
        name: PRODUCTS.outreachpilot.name,
        url: PRODUCTS.outreachpilot.url,
        signup: PRODUCTS.outreachpilot.signup,
        pricing: PRODUCTS.outreachpilot.pricing,
        mcpServerPage: PRODUCTS.outreachpilot.mcp,
        benchmark: PRODUCTS.outreachpilot.benchmark,
        methodology: PRODUCTS.outreachpilot.methodology,
      },
      fastlanding: {
        name: PRODUCTS.fastlanding.name,
        url: PRODUCTS.fastlanding.url,
        quoteForm: PRODUCTS.fastlanding.quote,
        chatbotPage: PRODUCTS.fastlanding.bot,
        aiPage: PRODUCTS.fastlanding.ai,
      },
    },
    outreachpilotPlans: {
      seller: ORG_IDS.outreachpilot,
      currency: 'PLN',
      vat: 'final price, seller VAT-exempt (art. 113 ust. 1 of the Polish VAT Act)',
      trialDays: OUTREACHPILOT_PLANS.trialDays,
      checkedOn: OUTREACHPILOT_PLANS.checked,
      source: OUTREACHPILOT_PLANS.source,
      plans: OUTREACHPILOT_PLANS.items.map((p) => ({
        key: p.key,
        name: both(p.name.pl, p.name.en),
        pricePLN: p.pricePLN,
        billing: p.pricePLN === 0 ? 'free, no time limit' : 'monthly',
        limits: both(p.limits.pl, p.limits.en),
      })),
    },
    offers: FASTLANDING_OFFERS.map((o) => {
      const p = parsePrice(o.price);
      return {
        seller: ORG_IDS.fastlanding,
        key: o.key,
        name: both(o.name.pl, o.name.en),
        priceAsPublished: both(o.price, o.priceEn),
        priceType: p.from ? 'starting-from' : 'fixed',
        amountPLN: p.amount,
        monthlyPLN: p.monthly,
        currency: 'PLN',
        vat: 'net',
        turnaround: both(o.time.pl, o.time.en),
        checkedOn: PRICES_CHECKED.fastlanding,
        source: PRODUCTS.fastlanding.url,
      };
    }),
    recurringOffers: FASTLANDING_RECURRING.map((o) => {
      const p = parsePrice(o.price);
      return {
        seller: ORG_IDS.fastlanding,
        key: o.key,
        name: both(o.name.pl, o.name.en),
        priceAsPublished: both(o.price, o.priceEn),
        priceType: p.from ? 'starting-from' : 'fixed',
        amountPLN: p.amount,
        billing: p.perMonth ? 'monthly' : 'one-off',
        currency: 'PLN',
        vat: 'net',
        checkedOn: PRICES_CHECKED.fastlanding,
        source: PRODUCTS.fastlanding.url,
      };
    }),
    benchmark: {
      emails: Number(BENCHMARK.emails.en.replace(/\D/g, '')),
      campaignsWithSends: BENCHMARK.campaignsWithSends,
      campaignsTotal: BENCHMARK.campaignsTotal,
      openRatePct: Number(BENCHMARK.openRate.en.replace('%', '')),
      replyRatePct: Number(BENCHMARK.replyRate.en.replace('%', '')),
      bounceRatePct: Number(BENCHMARK.bounceRate.en.replace('%', '')),
      dataFrozenOn: BENCHMARK.frozen,
      representative: false,
      source: PRODUCTS.outreachpilot.benchmark,
      methodology: PRODUCTS.outreachpilot.methodology,
    },
    registryStatistics: {
      systemOfRecord: PRODUCTS.outreachpilot.firms,
      note: 'Sector figures are active CEIDG entries per PKD code; a business with several PKD codes counts in each sector, so they must not be added up into a number of firms. Use the current figures on the source page.',
    },
    proof: PROOF.map((p) => ({
      value: p.value,
      label: both(p.label.pl, p.label.en),
      source: p.href,
      // the date of each number is part of its label (e.g. "29.09.2026", "sample 4,700, 7 Jul 2026")
    })),
    clientWork: PROJECTS.map((p) => ({
      name: p.name,
      url: p.url,
      kind: both(p.kind.pl, p.kind.en),
      description: both(p.blurb.pl, p.blurb.en),
      deliveredBy: ORG_IDS.fastlanding,
    })),
    clientWorkNote: 'outreachpilot.pl is the founder\'s own product, not client work.',
    salesConversations: {
      role: both(SALES.role.pl, SALES.role.en),
      bookingUrl: SALES.bookingUrl,
      duration: both(SALES.duration.pl, SALES.duration.en),
    },
    contact: {
      studioEmail: CONTACT.studioEmail,
      productEmail: CONTACT.productEmail,
      aiPhone: {
        number: CONTACT.aiPhone.display,
        note: 'AI assistant; discloses that it is an AI at the start of each call.',
      },
      publishedLocation: `${PERSON.city}, ${PERSON.country} (city only; no street address is published)`,
    },
    notClaimed: {
      pl: notClaimed('pl'),
      en: notClaimed('en'),
    },
  };
}

/** The honesty block, shared by llms.txt, llms-full.txt and facts.json. */
export function notClaimed(lang: Lang): string[] {
  return lang === 'pl'
    ? [
        'Brak nagród, certyfikatów, rankingów ani wzmianek prasowych: żadnych nie deklarujemy.',
        'Na kacper.biz nie ma opinii ani ocen klientów i nie są one oznaczane w danych strukturalnych.',
        LEGAL_NOTE.pl,
        'outreachpilot.pl to własny produkt założyciela, nie realizacja dla klienta; projekty w zakładce Realizacje to prace klientów FastLanding.',
        `Ceny FastLanding to ceny netto w PLN opublikowane na fastlanding.io (sprawdzone ${PRICES_CHECKED.fastlanding}); mogą się zmienić, a cena „od” jest ceną startową. Wiążąca jest oferta na fastlanding.io, a dla OutreachPilot cennik na outreachpilot.pl/cennik.`,
        `Jako lokalizacja publikowane jest tylko miasto (${PERSON.city}); adres ulicy nie jest publikowany.`,
        'Numer telefonu w danych kontaktowych obsługuje asystenta AI, który na początku rozmowy informuje, że jest AI.',
      ]
    : [
        'No awards, certifications, rankings or press coverage are claimed.',
        'kacper.biz publishes no customer reviews or ratings and marks none up as structured data.',
        LEGAL_NOTE.en,
        'outreachpilot.pl is the founder\'s own product, not client work; the projects on the Work page are FastLanding client work.',
        `FastLanding prices are net PLN prices published on fastlanding.io (checked ${PRICES_CHECKED.fastlanding}); they may change, and a "from" price is a starting price. The offer on fastlanding.io is binding, and for OutreachPilot the price list on outreachpilot.pl/cennik.`,
        `Only the city (${PERSON.city}) is published as location; no street address is published.`,
        'The phone number in the contact details is answered by an AI assistant that says it is an AI at the start of each call.',
      ];
}
