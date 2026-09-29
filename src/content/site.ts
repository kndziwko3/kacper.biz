/**
 * Single source of truth for every fact published on kacper.biz.
 *
 * RULE: only facts confirmed on outreachpilot.pl / fastlanding.io (re-checked 2026-09-29)
 * or supplied by the owner belong here. Anything the owner still has to provide is
 * marked `OWNER:`. The site renders fine without it and never invents a substitute.
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
  lastModified: '2026-09-29',
  themeColor: '#0b0b0a',
  /** Gliwice, used for the live clock and the map label. */
  geo: { lat: 50.2945, lon: 18.6714, tz: 'Europe/Warsaw' },
} as const;

/** Public contact addresses already used on both product sites. */
export const CONTACT = {
  studioEmail: 'kontakt@fastlanding.io',
  productEmail: 'kontakt@outreachpilot.pl',
  /** Phone line is an AI assistant that says it is an AI at the start of each call (outreachpilot.pl/llms.txt). */
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
  /** Used verbatim in schema.org `disambiguatingDescription` and once, visibly, on /o-mnie. */
  disambiguation: {
    pl: 'Przedsiębiorca z Gliwic, założyciel OutreachPilot.pl i FastLanding.io. To inna osoba niż Kacper Rękawek, badacz bezpieczeństwa międzynarodowego.',
    en: 'Entrepreneur from Gliwice, Poland, founder of OutreachPilot.pl and FastLanding.io. A different person from Kacper Rękawek, the international-security researcher.',
  } as L10n,
  knowsAbout: {
    pl: ['cold mailing B2B', 'pozyskiwanie klientów B2B', 'dane firm z CEIDG', 'strony internetowe', 'chatboty AI', 'automatyzacje AI', 'SEO i widoczność w AI', 'aplikacje MVP i SaaS'],
    en: ['B2B cold outreach', 'B2B lead generation', 'Polish company registry data (CEIDG)', 'websites', 'AI chatbots', 'AI automation', 'SEO and AI-search visibility', 'MVP and SaaS apps'],
  } as L10n<string[]>,
  /** Same LinkedIn URL that outreachpilot.pl uses (rel="me"). */
  linkedin: 'https://www.linkedin.com/in/kacper-r%C4%99kawek/',
  // OWNER: portrait photo and a 4-5 sentence founder story. /o-mnie has a slot for both.
  // OWNER: further public profiles (X, YouTube, Product Hunt, Crunchbase) go into `extraSameAs`.
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
    firms: 'https://outreachpilot.pl/firmy',
    mcp: 'https://outreachpilot.pl/dla-ai',
    about: 'https://outreachpilot.pl/o-redakcji',
    benchmark: 'https://outreachpilot.pl/raporty/cold-email-benchmark-polska-2026',
    methodology: 'https://outreachpilot.pl/raporty/metodologia',
    noWebsiteReport: 'https://outreachpilot.pl/raporty/firmy-bez-strony-www-2026',
    notAffiliatedWith: ['outreachpilot.co', 'outreachpilot.ai', 'useoutreachpilot.com'],
    tagline: {
      pl: 'Cold mailing B2B na polskich danych: firmy z CEIDG i Google Maps, maile pisane przez AI po polsku, wysyłka z Twojej skrzynki.',
      en: 'B2B cold outreach on Polish company data: businesses from CEIDG and Google Maps, emails written by AI in Polish, sent from your own mailbox.',
    } as L10n,
  },
  fastlanding: {
    id: `${SITE.url}/#fastlanding`,
    name: 'FastLanding.io',
    url: 'https://fastlanding.io',
    quote: 'https://fastlanding.io/#kontakt',
    bot: 'https://fastlanding.io/chatboty-ai',
    about: 'https://fastlanding.io/o-nas',
    ai: 'https://fastlanding.io/dla-ai',
    us: 'https://fastlanding.io/us',
    uk: 'https://fastlanding.io/uk',
    tagline: {
      pl: 'Studio z Gliwic: strony internetowe, chatboty AI, automatyzacje, aplikacje MVP i widoczność w wyszukiwarkach AI. Stała cena, termin w umowie, kod dla klienta.',
      en: 'Gliwice studio: websites, AI chatbots, automations, MVP apps and AI-search visibility. Fixed price, deadline in the contract, code owned by the client.',
    } as L10n,
  },
} as const;

/** One-off prices as published on fastlanding.io on 2026-09-29 (PLN, net). Do not convert for other markets. */
export const FASTLANDING_OFFERS = [
  { key: 'landing', price: '1 499 zł', priceEn: 'PLN 1,499', time: { pl: '7 dni', en: '7 days' } as L10n, name: { pl: 'Landing page', en: 'Landing page' } as L10n },
  { key: 'site', price: '2 899 zł', priceEn: 'PLN 2,899', time: { pl: '14 dni', en: '14 days' } as L10n, name: { pl: 'Strona firmowa z CMS', en: 'Business site with CMS' } as L10n },
  { key: 'bot', price: 'od 1 990 zł + 190 zł/mies.', priceEn: 'from PLN 1,990 + PLN 190/mo', time: { pl: '3–5 dni', en: '3–5 days' } as L10n, name: { pl: 'Chatbot AI FastBot', en: 'AI chatbot FastBot' } as L10n },
  { key: 'automation', price: 'od 990 zł', priceEn: 'from PLN 990', time: { pl: '2–5 dni', en: '2–5 days' } as L10n, name: { pl: 'Automatyzacja AI', en: 'AI automation' } as L10n },
  { key: 'mvp', price: 'od 9 990 zł', priceEn: 'from PLN 9,990', time: { pl: 'ok. 30 dni', en: '~30 days' } as L10n, name: { pl: 'Aplikacja MVP lub SaaS', en: 'MVP or SaaS app' } as L10n },
  { key: 'audit', price: '1 490 zł', priceEn: 'PLN 1,490', time: { pl: '10 dni roboczych', en: '10 working days' } as L10n, name: { pl: 'Audyt SEO i widoczności w AI', en: 'SEO and AI-visibility audit' } as L10n },
] as const;

/** Recurring SEO/GEO services on fastlanding.io (2026-09-29). Kept apart: schema treats FASTLANDING_OFFERS as one-off prices. */
export const FASTLANDING_RECURRING = [
  { key: 'geo-setup', price: '2 290 zł', priceEn: 'PLN 2,290', name: { pl: 'Widoczność w ChatGPT i Google AI (wdrożenie)', en: 'Visibility in ChatGPT and Google AI (setup)' } as L10n },
  { key: 'seo', price: 'od 1 490 zł/mies.', priceEn: 'from PLN 1,490/mo', name: { pl: 'Pozycjonowanie SEO i GEO', en: 'SEO and GEO' } as L10n },
  { key: 'local', price: '690 zł/mies.', priceEn: 'PLN 690/mo', name: { pl: 'Pozycjonowanie lokalne', en: 'Local SEO' } as L10n },
] as const;

/** Sales conversations: Justyna Lajca, Head of Sales (named with surname on fastlanding.io). Booking page used by both products. */
export const SALES = {
  firstName: 'Justyna',
  fullName: 'Justyna Lajca',
  initials: 'JL',
  role: { pl: 'Head of Sales w FastLanding i OutreachPilot', en: 'Head of Sales at FastLanding and OutreachPilot' } as L10n,
  bookingUrl: 'https://calendly.com/lajcajustyna/30min',
  duration: { pl: '30 minut', en: '30 minutes' } as L10n,
  // Deliberately no photo and no Person schema: not supplied for this site.
} as const;

/**
 * Client work delivered by FastLanding, described as on fastlanding.io (checked 2026-09-27/29), no invented results.
 * Screenshots come from fastlanding.io/img/work (FastLanding's own captures of its projects).
 * outreachpilot.pl is NOT client work: it is the founder's own product (see PRODUCTS).
 */
export const PROJECTS = [
  {
    key: 'stomatologia',
    name: 'Stomatologia Mikroskopowa',
    url: 'https://www.stomatologiamikroskopowa.com',
    host: 'stomatologiamikroskopowa.com',
    checked: '2026-09-29',
    langs: 'PL',
    kind: { pl: 'Strona firmowa · stomatologia, Gliwice', en: 'Business site · dentistry, Gliwice' } as L10n,
    blurb: {
      pl: 'Gabinet stomatologii mikroskopowej w Gliwicach: leczenie kanałowe i zachowawcze pod mikroskopem z powiększeniem do 25×, siedem usług i wizyty umawiane telefonicznie.',
      en: 'A microscope dentistry practice in Gliwice: root-canal and conservative treatment under up to 25× magnification, seven services and appointments booked by phone.',
    } as L10n,
  },
  {
    key: 'hellohome',
    name: 'Hello Home',
    url: 'https://hello-home.es',
    host: 'hello-home.es',
    checked: '2026-09-27',
    langs: 'PL · EN · ES',
    kind: { pl: 'Serwis z ofertami · nieruchomości, Costa Blanca', en: 'Listings site · real estate, Costa Blanca' } as L10n,
    blurb: {
      pl: 'Licencjonowana agencja nieruchomości w Hiszpanii z pełną obsługą po polsku: oferty willi i apartamentów, poradnik zakupu i kredyt hipoteczny.',
      en: 'A licensed real-estate agency in Spain with full service in Polish: villa and apartment listings, a buying guide and mortgages.',
    } as L10n,
  },
  {
    key: 'casaflamingo',
    name: 'Casa Flamingo',
    url: 'https://casaflamingo07.com',
    host: 'casaflamingo07.com',
    checked: '2026-09-27',
    langs: 'PL · EN · DE · ES',
    kind: { pl: 'Landing rezerwacyjny · wynajem wakacyjny', en: 'Booking landing page · holiday rental' } as L10n,
    blurb: {
      pl: 'Willa wakacyjna w Ciudad Quesada z prywatnym basenem: galeria, atrakcje okolicy i sprawdzanie dostępności terminów.',
      en: 'A holiday villa in Ciudad Quesada with a private pool: gallery, local attractions and availability check.',
    } as L10n,
  },
] as const;

/** Numbers published on the product sites, each with its source and date. */
export const PROOF = [
  { value: '3 181 616', label: { pl: 'aktywnych JDG w 30 branżach usługowych w CEIDG (29.09.2026)', en: 'active sole proprietorships in 30 service sectors in CEIDG (29 Sep 2026)' } as L10n, href: PRODUCTS.outreachpilot.firms },
  { value: '3%', label: { pl: 'mikrofirm podaje stronę www we wpisie CEIDG (próba 4 700, 7.07.2026)', en: 'of micro-businesses list a website in their CEIDG entry (sample 4,700, 7 Jul 2026)' } as L10n, href: PRODUCTS.outreachpilot.noWebsiteReport },
  { value: '20 418', label: { pl: 'maili w benchmarku kampanii OutreachPilot', en: 'emails in the OutreachPilot campaign benchmark' } as L10n, href: PRODUCTS.outreachpilot.methodology },
  { value: '39', label: { pl: 'narzędzi w serwerze MCP dla Claude i ChatGPT', en: 'tools in the MCP server for Claude and ChatGPT' } as L10n, href: PRODUCTS.outreachpilot.mcp },
] as const;

/** Campaign benchmark as published (outreachpilot.pl/raporty, data frozen 31.08.2026). */
export const BENCHMARK = {
  openRate: { pl: '28,5%', en: '28.5%' } as L10n,
  replyRate: { pl: '1,7%', en: '1.7%' } as L10n,
  bounceRate: { pl: '0,8%', en: '0.8%' } as L10n,
  emails: { pl: '20 418', en: '20,418' } as L10n,
  campaignsWithSends: 177,
  campaignsTotal: 211,
  frozen: '2026-08-31',
} as const;

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
  pl: 'OutreachPilot nie deklaruje automatycznej zgodności kampanii z RODO ani z Prawem komunikacji elektronicznej. Podstawę przetwarzania danych i zgodę na kontakt ocenia nadawca. To informacja o produkcie, nie porada prawna.',
  en: 'OutreachPilot does not claim automatic GDPR or Polish electronic-communications-law compliance for campaigns. The sender assesses the legal basis and consent. This is product information, not legal advice.',
} as L10n;
