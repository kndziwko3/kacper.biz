/**
 * Single source of truth for every fact published on kacper.biz.
 *
 * RULE: only facts confirmed on outreachpilot.pl / fastlanding.io (checked 2026-09-28)
 * or supplied by the owner belong here. Anything the owner still has to provide is
 * marked `OWNER:` — the site renders fine without it and never invents a substitute.
 */

export type Lang = 'pl' | 'en';
export type L10n<T = string> = Record<Lang, T>;

export const SITE = {
  url: 'https://kacper.biz',
  name: 'Kacper Rękawek',
  domain: 'kacper.biz',
  locale: { pl: 'pl-PL', en: 'en' } as Record<Lang, string>,
  ogLocale: { pl: 'pl_PL', en: 'en_US' } as Record<Lang, string>,
  /** Dated facts + dateModified signals. Bump when any fact below changes. */
  lastModified: '2026-09-28',
  themeColor: '#07070a',
} as const;

/** Where lead-form submissions are sent (see api/lead.js). Public contact addresses already used on both product sites. */
export const CONTACT = {
  studioEmail: 'kontakt@fastlanding.io',
  productEmail: 'kontakt@outreachpilot.pl',
  /** Phone line is an AI assistant that discloses it is AI at the start of each call (per outreachpilot.pl/llms.txt). */
  aiPhone: { display: '+48 91 882 15 67', href: 'tel:+48918821567' },
} as const;

export const PERSON = {
  id: `${SITE.url}/#person`,
  name: 'Kacper Rękawek',
  givenName: 'Kacper',
  familyName: 'Rękawek',
  alternateName: ['Kacper Rekawek', 'Kasper Rękawek'],
  city: 'Gliwice',
  region: 'Śląskie',
  country: 'PL',
  jobTitle: {
    pl: 'Założyciel OutreachPilot.pl i FastLanding.io',
    en: 'Founder of OutreachPilot.pl and FastLanding.io',
  } as L10n,
  /** Used verbatim in schema.org `disambiguatingDescription` and in the visible FAQ. Owner should confirm wording. */
  disambiguation: {
    pl: 'Przedsiębiorca z Gliwic, założyciel OutreachPilot.pl i FastLanding.io. To nie ten sam Kacper Rękawek, który jest badaczem bezpieczeństwa międzynarodowego.',
    en: 'Entrepreneur from Gliwice, Poland, founder of OutreachPilot.pl and FastLanding.io. Not the same person as the Kacper Rękawek who is an international-security researcher.',
  } as L10n,
  knowsAbout: {
    pl: ['cold mailing B2B', 'pozyskiwanie klientów B2B', 'dane firm CEIDG', 'strony internetowe', 'chatboty AI', 'automatyzacje AI', 'SEO techniczne', 'aplikacje MVP i SaaS'],
    en: ['B2B cold outreach', 'B2B lead generation', 'Polish company registry data (CEIDG)', 'websites', 'AI chatbots', 'AI automation', 'technical SEO', 'MVP and SaaS apps'],
  } as L10n<string[]>,
  /** Same LinkedIn URL that outreachpilot.pl uses (rel="me"). fastlanding.io uses an unencoded variant — see docs/product-site-fixes.md. */
  linkedin: 'https://www.linkedin.com/in/kacper-r%C4%99kawek/',
  // OWNER: photo — none supplied, so the site uses a typographic/3D identity instead of a portrait.
  // OWNER: any further public profiles (X, YouTube, Product Hunt, Crunchbase) → add to `sameAs` below.
  extraSameAs: [] as string[],
  business: {
    legalName: 'Kacper Rękawek FastLanding',
    nip: '6312736932',
    regon: '543406517',
  },
} as const;

export const PRODUCTS = {
  outreachpilot: {
    id: `${SITE.url}/#outreachpilot`,
    name: 'OutreachPilot.pl',
    url: 'https://outreachpilot.pl',
    signup: 'https://outreachpilot.pl/rejestracja',
    pricing: 'https://outreachpilot.pl/cennik',
    mcp: 'https://outreachpilot.pl/dla-ai',
    about: 'https://outreachpilot.pl/o-redakcji',
    benchmark: 'https://outreachpilot.pl/raporty/cold-email-benchmark-polska-2026',
    methodology: 'https://outreachpilot.pl/raporty/metodologia',
    notAffiliatedWith: ['outreachpilot.co', 'outreachpilot.ai', 'useoutreachpilot.com'],
    tagline: {
      pl: 'Cold mailing B2B na polskich danych: firmy z Google Maps, PKT.pl i CEIDG, kampania pisana przez AI po polsku, wysyłka z Twojej skrzynki.',
      en: 'B2B cold outreach on Polish company data: businesses from Google Maps, PKT.pl and CEIDG, campaigns written by AI in Polish, sent from your own mailbox.',
    } as L10n,
  },
  fastlanding: {
    id: `${SITE.url}/#fastlanding`,
    name: 'FastLanding.io',
    url: 'https://fastlanding.io',
    quote: 'https://fastlanding.io/#kontakt',
    about: 'https://fastlanding.io/o-nas',
    ai: 'https://fastlanding.io/dla-ai',
    us: 'https://fastlanding.io/us',
    uk: 'https://fastlanding.io/uk',
    tagline: {
      pl: 'Studio z Gliwic: strony internetowe, chatboty AI, automatyzacje i aplikacje MVP. Stała cena, realizacja w dniach, zero spotkań.',
      en: 'Gliwice-based studio: websites, AI chatbots, automations and MVP apps. Fixed price, delivered in days, zero meetings.',
    } as L10n,
  },
} as const;

/** Prices as published on fastlanding.io on 2026-09-28 (PLN, net). Do not convert for other markets. */
export const FASTLANDING_OFFERS = [
  { key: 'landing', price: 'od 1 499 zł', priceEn: 'from PLN 1,499', time: { pl: '7 dni', en: '7 days' } as L10n, name: { pl: 'Landing page', en: 'Landing page' } as L10n },
  { key: 'site', price: '2 899 zł', priceEn: 'PLN 2,899', time: { pl: '14 dni', en: '14 days' } as L10n, name: { pl: 'Strona firmowa z CMS', en: 'Business site with CMS' } as L10n },
  { key: 'bot', price: 'od 1 990 zł + 190 zł/mies.', priceEn: 'from PLN 1,990 + PLN 190/mo', time: { pl: '3–5 dni', en: '3–5 days' } as L10n, name: { pl: 'Chatbot AI (FastBot)', en: 'AI chatbot (FastBot)' } as L10n },
  { key: 'automation', price: 'od 990 zł', priceEn: 'from PLN 990', time: { pl: '2–5 dni', en: '2–5 days' } as L10n, name: { pl: 'Automatyzacja AI', en: 'AI automation' } as L10n },
  { key: 'mvp', price: 'od 9 990 zł', priceEn: 'from PLN 9,990', time: { pl: 'ok. 30 dni', en: '~30 days' } as L10n, name: { pl: 'Aplikacja MVP / SaaS', en: 'MVP / SaaS app' } as L10n },
] as const;

/** Sales conversations run by Justyna (Head of Sales, OutreachPilot) — the owner confirmed her role; booking page is the existing one. */
export const SALES = {
  firstName: 'Justyna',
  role: { pl: 'Head of Sales, OutreachPilot', en: 'Head of Sales, OutreachPilot' } as L10n,
  bookingUrl: 'https://outreachpilot.pl/umow-demo?plan=indywidualny',
  duration: { pl: '30 minut', en: '30 minutes' } as L10n,
  // Deliberately no surname, photo or bio: not supplied for this site. See docs/owner-todo.md.
} as const;

/** Client work delivered by FastLanding. outreachpilot.pl is NOT client work — it is the founder's own product. */
export const PROJECTS = [
  {
    key: 'hello-home',
    name: 'Hello Home',
    url: 'https://hello-home.es',
    kind: { pl: 'Serwis z ofertami · nieruchomości', en: 'Listings site · real estate' } as L10n,
    blurb: {
      pl: 'Licencjonowana agencja nieruchomości na Costa Blanca. Serwis z ofertami willi i apartamentów, obsługa po polsku, wersje PL / EN / ES.',
      en: 'Licensed real-estate agency on the Costa Blanca. Listings for villas and apartments, Polish-language service, PL / EN / ES versions.',
    } as L10n,
  },
  {
    key: 'soleil',
    name: 'Soleil Energia',
    url: 'https://soleilenergia.pl',
    kind: { pl: 'Strona firmowa · OZE / instalacje', en: 'Business site · renewables / installations' } as L10n,
    blurb: {
      pl: 'Strona firmowa wykonawcy instalacji elektrycznych, grzewczych i fotowoltaicznych, z lejkiem na bezpłatną konsultację.',
      en: 'Business site for an electrical, heating and photovoltaic installer, built around a free-consultation funnel.',
    } as L10n,
  },
  {
    key: 'casa-flamingo',
    name: 'Casa Flamingo',
    url: 'https://casaflamingo07.com',
    kind: { pl: 'Landing rezerwacyjny · wynajem wakacyjny', en: 'Booking landing page · holiday rental' } as L10n,
    blurb: {
      pl: 'Strona rezerwacyjna willi wakacyjnej w Ciudad Quesada (Costa Blanca) w czterech wersjach językowych, z galerią i kontaktem WhatsApp.',
      en: 'Booking page for a holiday villa in Ciudad Quesada (Costa Blanca) in four languages, with gallery and WhatsApp contact.',
    } as L10n,
  },
] as const;

/** Numbers shown in the proof strip — each is published on the linked page. */
export const PROOF = [
  { value: '16/16', label: { pl: 'województw w danych CEIDG', en: 'voivodeships covered in CEIDG data' } as L10n, href: PRODUCTS.outreachpilot.url },
  { value: '39', label: { pl: 'narzędzi w serwerze MCP dla Claude i ChatGPT', en: 'tools in the MCP server for Claude and ChatGPT' } as L10n, href: PRODUCTS.outreachpilot.mcp },
  { value: '20 418', label: { pl: 'maili w opublikowanym benchmarku kampanii', en: 'emails in the published campaign benchmark' } as L10n, href: PRODUCTS.outreachpilot.methodology },
  { value: '7 dni', label: { pl: 'od briefu do landing page', en: 'from brief to landing page' } as L10n, href: PRODUCTS.fastlanding.url },
] as const;

export const NAV = {
  pl: [
    { href: '/outreachpilot', label: 'OutreachPilot' },
    { href: '/fastlanding', label: 'FastLanding' },
    { href: '/realizacje', label: 'Realizacje' },
    { href: '/o-mnie', label: 'O mnie' },
    { href: '/kontakt', label: 'Kontakt' },
  ],
  en: [
    { href: '/en/outreachpilot', label: 'OutreachPilot' },
    { href: '/en/fastlanding', label: 'FastLanding' },
    { href: '/en/work', label: 'Work' },
    { href: '/en/about', label: 'About' },
    { href: '/en/contact', label: 'Contact' },
  ],
} as const;

/** PL <-> EN route pairs, used for the language switch and hreflang. Keep in sync with src/pages. */
export const ROUTE_PAIRS: Array<{ pl: string; en: string }> = [
  { pl: '/', en: '/en' },
  { pl: '/outreachpilot', en: '/en/outreachpilot' },
  { pl: '/fastlanding', en: '/en/fastlanding' },
  { pl: '/realizacje', en: '/en/work' },
  { pl: '/o-mnie', en: '/en/about' },
  { pl: '/kontakt', en: '/en/contact' },
  { pl: '/polityka-prywatnosci', en: '/en/privacy' },
];

/** Cold-mailing legal caveat, reproduced from outreachpilot.pl so kacper.biz never over-promises. */
export const LEGAL_NOTE = {
  pl: 'OutreachPilot nie deklaruje automatycznej zgodności kampanii z RODO ani Prawem komunikacji elektronicznej. Podstawę przetwarzania danych i zgodę na kontakt ocenia nadawca. To informacja o produkcie, nie porada prawna.',
  en: 'OutreachPilot does not claim automatic GDPR or Polish electronic-communications-law compliance for campaigns. The sender assesses the legal basis and consent. This is product information, not legal advice.',
} as L10n;
