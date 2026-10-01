/**
 * JSON-LD entity graph for kacper.biz.
 *
 * Design goals
 *  1. kacper.biz is the founder-side "entity home": one Person node (PERSON.id) that carries the disambiguation
 *     against the namesake security researcher, linked both ways to the two organisations.
 *  2. The organisation nodes REUSE the @ids the product sites already publish
 *     (https://outreachpilot.pl/#organization, https://fastlanding.io/#organization) so the entities merge across domains.
 *     They stay deliberately small: the product sites hold the full data, this is the founder-side confirmation.
 *  3. Google's rule: markup must match visible content. Everything is derived from src/content/site.ts, which is also what
 *     the pages render. No AggregateRating / Review anywhere. No Person node for anybody except Kacper (Justyna has none).
 *     No street address (city only). No credentials, awards or press.
 *  4. Every @id reference resolves inside the emitted @graph (checked at build time, see findDanglingRefs).
 */
import {
  SITE,
  PERSON,
  PRODUCTS,
  PROJECTS,
  CONTACT,
  FASTLANDING_OFFERS,
  FASTLANDING_RECURRING,
  OUTREACHPILOT_PLANS,
  type Lang,
} from '../content/site';
import {
  ORG_IDS,
  absUrl,
  faqAnchor,
  fastlandingDisambiguation,
  normalizePath,
  outreachpilotDisambiguation,
  parsePrice,
  personDescription,
  personSameAs,
  stripHtml,
} from './facts';

export interface JsonLdOptions {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  kind?: 'home' | 'about' | 'product' | 'work' | 'contact' | 'legal';
  breadcrumbs?: { name: string; path: string }[];
  faq?: { q: string; a: string }[];
  extra?: Record<string, unknown>[];
}

type Node = Record<string, unknown>;

/** Date kacper.biz went live. dateCreated on the ProfilePage; never bump it (unlike SITE.lastModified). */
const SITE_CREATED = '2026-09-28';

export const WEBSITE_ID = `${SITE.url}/#website`;

const ref = (id: string): Node => ({ '@id': id });

const postalAddress = (): Node => ({
  '@type': 'PostalAddress',
  addressLocality: PERSON.city,
  addressRegion: PERSON.region,
  addressCountry: PERSON.country,
});

/* ───────────────────────── site-wide nodes ───────────────────────── */

function websiteNode(lang: Lang): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: SITE.domain,
    inLanguage: [SITE.locale.pl, SITE.locale.en],
    description: lang === 'pl' ? PERSON.jobTitle.pl : PERSON.jobTitle.en,
    publisher: ref(PERSON.id),
    author: ref(PERSON.id),
  };
}

function personNode(lang: Lang): Node {
  return {
    '@type': 'Person',
    '@id': PERSON.id,
    name: PERSON.name,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    alternateName: [...PERSON.alternateName],
    url: `${SITE.url}/`,
    jobTitle: PERSON.jobTitle[lang],
    description: personDescription(lang),
    // Namesake-collision defence: another Kacper Rękawek (an international-security researcher) dominates name SERPs.
    disambiguatingDescription: PERSON.disambiguation[lang],
    homeLocation: { '@type': 'Place', address: postalAddress() },
    address: postalAddress(),
    knowsAbout: [...PERSON.knowsAbout[lang]],
    // Visible on /o-mnie (facts row "Języki: polski, angielski"). BCP 47 codes.
    knowsLanguage: ['pl', 'en'],
    sameAs: personSameAs(),
    worksFor: [ref(ORG_IDS.outreachpilot), ref(ORG_IDS.fastlanding)],
  };
}

interface ContactPointInput {
  email?: string;
  telephone?: string;
  description?: string;
}

function contactPoints(items: ContactPointInput[]): Node[] {
  return items.map((c) => ({
    '@type': 'ContactPoint',
    contactType: 'customer service',
    ...(c.email ? { email: c.email } : {}),
    ...(c.telephone ? { telephone: c.telephone } : {}),
    ...(c.description ? { description: c.description } : {}),
  }));
}

const NIP_IDENTIFIERS = (): Node[] => [
  { '@type': 'PropertyValue', propertyID: 'NIP', value: PERSON.business.nip },
  { '@type': 'PropertyValue', propertyID: 'REGON', value: PERSON.business.regon },
];

function outreachpilotOrgNode(lang: Lang, withContact: boolean): Node {
  const aiPhoneNote =
    lang === 'pl'
      ? 'Asystent telefoniczny AI; na początku każdej rozmowy informuje, że jest AI.'
      : 'AI phone assistant; states that it is an AI at the start of each call.';
  return {
    '@type': 'Organization',
    '@id': ORG_IDS.outreachpilot,
    name: PRODUCTS.outreachpilot.name,
    alternateName: 'OutreachPilot',
    url: PRODUCTS.outreachpilot.url,
    description: PRODUCTS.outreachpilot.tagline[lang],
    disambiguatingDescription: outreachpilotDisambiguation(lang),
    founder: ref(PERSON.id),
    taxID: PERSON.business.nip,
    identifier: NIP_IDENTIFIERS(),
    address: postalAddress(),
    ...(withContact
      ? {
          contactPoint: contactPoints([
            { email: CONTACT.productEmail },
            { telephone: CONTACT.aiPhone.display, description: aiPhoneNote },
          ]),
        }
      : {}),
  };
}

function fastlandingOrgNode(lang: Lang, withContact: boolean): Node {
  return {
    '@type': 'ProfessionalService',
    '@id': ORG_IDS.fastlanding,
    name: PRODUCTS.fastlanding.name,
    alternateName: 'FastLanding',
    legalName: PERSON.business.legalName,
    url: PRODUCTS.fastlanding.url,
    description: PRODUCTS.fastlanding.tagline[lang],
    disambiguatingDescription: fastlandingDisambiguation(lang),
    founder: ref(PERSON.id),
    taxID: PERSON.business.nip,
    identifier: NIP_IDENTIFIERS(),
    address: postalAddress(),
    areaServed: { '@type': 'Country', name: lang === 'pl' ? 'Polska' : 'Poland' },
    ...(withContact ? { contactPoint: contactPoints([{ email: CONTACT.studioEmail }]) } : {}),
  };
}

/* ───────────────────────── page-specific nodes ───────────────────────── */

type ProductKey = 'outreachpilot' | 'fastlanding';

/** Product pages are identified by route (`/outreachpilot`, `/en/fastlanding`, …). */
function productKeyFor(path: string): ProductKey | null {
  const last = normalizePath(path).split('/').filter(Boolean).pop();
  return last === 'outreachpilot' || last === 'fastlanding' ? last : null;
}

function outreachpilotServiceNode(lang: Lang): Node {
  // Typed Service (semantics of software via additionalType) on purpose: a literal SoftwareApplication needs offers AND a
  // rating/review for Google's "Software app" rich result, and we neither invent ratings nor mirror pricing that is not in
  // site.ts, so it would only produce invalid-item noise in Search Console. Pricing lives on outreachpilot.pl/cennik.
  // The plans ARE shown on the page (OpSheet renders copy.op.plans.rows), so they are marked up as offers; numbers come from
  // OUTREACHPILOT_PLANS in site.ts and validate-seo.mjs checks that each price is visible. Final prices: the seller is
  // VAT-exempt, so valueAddedTaxIncluded is deliberately omitted (there is no VAT to include or add).
  const vatNote = lang === 'pl' ? 'cena końcowa, sprzedawca zwolniony z VAT' : 'final price, seller VAT-exempt';
  return {
    '@type': 'Service',
    '@id': PRODUCTS.outreachpilot.id,
    additionalType: 'https://schema.org/SoftwareApplication',
    name: PRODUCTS.outreachpilot.name,
    url: PRODUCTS.outreachpilot.url,
    description: PRODUCTS.outreachpilot.tagline[lang],
    serviceType: lang === 'pl' ? 'cold mailing B2B' : 'B2B cold outreach',
    provider: ref(ORG_IDS.outreachpilot),
    areaServed: { '@type': 'Country', name: lang === 'pl' ? 'Polska' : 'Poland' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'pl' ? 'Plany OutreachPilot.pl' : 'OutreachPilot.pl plans',
      itemListElement: OUTREACHPILOT_PLANS.items.map((p) => ({
        '@type': 'Offer',
        name: `${PRODUCTS.outreachpilot.name} ${p.name[lang]}`,
        description: `${p.limits[lang]} (${vatNote})`,
        price: p.pricePLN,
        priceCurrency: 'PLN',
        ...(p.pricePLN > 0
          ? {
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: p.pricePLN,
                priceCurrency: 'PLN',
                unitCode: 'MON',
                unitText: lang === 'pl' ? 'miesiąc' : 'month',
              },
            }
          : {}),
        seller: ref(ORG_IDS.outreachpilot),
        url: PRODUCTS.outreachpilot.pricing,
      })),
    },
  };
}

type PublishedOffer = { price: string; priceEn: string; name: { pl: string; en: string }; time?: { pl: string; en: string } };

function offerNode(o: PublishedOffer, lang: Lang): Node {
  const published = lang === 'pl' ? o.price : o.priceEn;
  const parsed = parsePrice(o.price); // numbers come from the PL string; the EN string is the same amounts
  const specs: Node[] = [];
  if (parsed.amount !== null) {
    const amount = parsed.from ? { minPrice: parsed.amount } : { price: parsed.amount };
    specs.push(
      parsed.perMonth
        ? {
            '@type': 'UnitPriceSpecification',
            ...amount,
            priceCurrency: 'PLN',
            unitCode: 'MON',
            unitText: lang === 'pl' ? 'miesiąc' : 'month',
            valueAddedTaxIncluded: false,
          }
        : { '@type': 'PriceSpecification', ...amount, priceCurrency: 'PLN', valueAddedTaxIncluded: false },
    );
  }
  if (parsed.monthly !== null) {
    specs.push({
      '@type': 'UnitPriceSpecification',
      price: parsed.monthly,
      priceCurrency: 'PLN',
      unitCode: 'MON',
      unitText: lang === 'pl' ? 'miesiąc' : 'month',
      valueAddedTaxIncluded: false,
    });
  }
  return {
    '@type': 'Offer',
    name: o.name[lang],
    // Text mirrors the visible price (+ turnaround when published), e.g. "1 499 zł · 7 dni".
    description: o.time ? `${published} · ${o.time[lang]}` : published,
    priceCurrency: 'PLN',
    ...(specs.length ? { priceSpecification: specs.length === 1 ? specs[0] : specs } : {}),
    itemOffered: { '@type': 'Service', name: o.name[lang] },
    seller: ref(ORG_IDS.fastlanding),
    url: PRODUCTS.fastlanding.url,
  };
}

function fastlandingServiceNode(lang: Lang): Node {
  return {
    '@type': 'Service',
    '@id': PRODUCTS.fastlanding.id,
    name: PRODUCTS.fastlanding.name,
    url: PRODUCTS.fastlanding.url,
    description: PRODUCTS.fastlanding.tagline[lang],
    serviceType: FASTLANDING_OFFERS.map((o) => o.name[lang]),
    provider: ref(ORG_IDS.fastlanding),
    areaServed: { '@type': 'Country', name: lang === 'pl' ? 'Polska' : 'Poland' },
    // Prices as published on fastlanding.io (net PLN, checked SITE.lastModified). The product page must show the same numbers.
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'pl' ? 'Oferta FastLanding.io (ceny netto)' : 'FastLanding.io offers (net prices)',
      // One-off prices first, then the monthly SEO / AI-visibility services, all as shown in the FastLanding price sheet.
      itemListElement: [...FASTLANDING_OFFERS, ...FASTLANDING_RECURRING].map((o) => offerNode(o, lang)),
    },
  };
}

function projectsListNode(canonical: string, lang: Lang): Node {
  return {
    '@type': 'ItemList',
    '@id': `${canonical}#projects`,
    name: lang === 'pl' ? 'Realizacje FastLanding' : 'FastLanding client work',
    numberOfItems: PROJECTS.length,
    itemListElement: PROJECTS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        '@id': `${SITE.url}/#project-${p.key}`,
        name: p.name,
        url: p.url,
        description: p.blurb[lang],
        genre: p.kind[lang],
        // Languages and the screenshot are both shown on the Work page (case rows + the full-page capture).
        inLanguage: p.langs.split('·').map((l) => l.trim().toLowerCase()),
        image: `${SITE.url}/work/${p.key}-hero.webp`,
        creator: ref(ORG_IDS.fastlanding),
      },
    })),
  };
}

function pageNode(o: JsonLdOptions, canonical: string, hasBreadcrumb: boolean, productKey: ProductKey | null): Node {
  const base: Node = {
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: o.title,
    description: o.description,
    inLanguage: SITE.locale[o.lang],
    isPartOf: ref(WEBSITE_ID),
    dateModified: SITE.lastModified,
    ...(hasBreadcrumb ? { breadcrumb: ref(`${canonical}#breadcrumb`) } : {}),
  };

  switch (o.kind) {
    case 'home':
      return { '@type': 'WebPage', ...base, about: ref(PERSON.id), mainEntity: ref(PERSON.id) };
    case 'about':
      // Google ProfilePage: mainEntity (Person) required, dateCreated + dateModified recommended.
      return {
        '@type': 'ProfilePage',
        ...base,
        dateCreated: SITE_CREATED,
        mainEntity: ref(PERSON.id),
        about: ref(PERSON.id),
      };
    case 'product': {
      if (productKey === 'outreachpilot') {
        return { '@type': 'WebPage', ...base, about: ref(ORG_IDS.outreachpilot), mainEntity: ref(PRODUCTS.outreachpilot.id) };
      }
      if (productKey === 'fastlanding') {
        return { '@type': 'WebPage', ...base, about: ref(ORG_IDS.fastlanding), mainEntity: ref(PRODUCTS.fastlanding.id) };
      }
      return { '@type': 'WebPage', ...base };
    }
    case 'work':
      return {
        '@type': 'CollectionPage',
        ...base,
        about: ref(ORG_IDS.fastlanding),
        mainEntity: ref(`${canonical}#projects`),
      };
    case 'contact':
      return { '@type': 'ContactPage', ...base, about: [ref(ORG_IDS.fastlanding), ref(ORG_IDS.outreachpilot)] };
    case 'legal':
    default:
      return { '@type': 'WebPage', ...base };
  }
}

function breadcrumbNode(canonical: string, crumbs: NonNullable<JsonLdOptions['breadcrumbs']>): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  };
}

function faqNode(canonical: string, lang: Lang, faq: NonNullable<JsonLdOptions['faq']>): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    url: canonical,
    inLanguage: SITE.locale[lang],
    isPartOf: ref(`${canonical}#webpage`),
    // Copy strings carry typography (no-break spaces, U+2060 word joiners in ranges, inline tags): plain text for machines.
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: stripHtml(f.q),
      // the visible <div class="faq-item" id="…"> carries the same id (Faq.astro), so this URL lands on the answer
      url: `${canonical}#${faqAnchor(f.q)}`,
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) },
    })),
  };
}

/* ───────────────────────── integrity check ───────────────────────── */

/** Returns every `{ "@id": "…" }`-only reference in the graph that has no defining node with that @id. */
export function findDanglingRefs(graph: unknown[]): string[] {
  const defined = new Set<string>();
  const refs = new Set<string>();
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (typeof v !== 'object' || v === null) return;
    const rec = v as Record<string, unknown>;
    const id = rec['@id'];
    if (typeof id === 'string') {
      if (Object.keys(rec).length === 1) refs.add(id);
      else defined.add(id);
    }
    Object.values(rec).forEach(walk);
  };
  walk(graph);
  return [...refs].filter((id) => !defined.has(id));
}

/* ───────────────────────── public API ───────────────────────── */

export function buildJsonLd(o: JsonLdOptions): string {
  const canonical = absUrl(o.path);
  const hasBreadcrumb = Boolean(o.breadcrumbs && o.breadcrumbs.length > 0);
  const productKey = o.kind === 'product' ? productKeyFor(o.path) : null;
  const isContact = o.kind === 'contact';

  const graph: Node[] = [
    websiteNode(o.lang),
    personNode(o.lang),
    outreachpilotOrgNode(o.lang, isContact),
    fastlandingOrgNode(o.lang, isContact),
    pageNode(o, canonical, hasBreadcrumb, productKey),
  ];

  if (productKey === 'outreachpilot') graph.push(outreachpilotServiceNode(o.lang));
  if (productKey === 'fastlanding') graph.push(fastlandingServiceNode(o.lang));
  if (o.kind === 'work') graph.push(projectsListNode(canonical, o.lang));
  if (hasBreadcrumb && o.breadcrumbs) graph.push(breadcrumbNode(canonical, o.breadcrumbs));
  if (o.faq && o.faq.length > 0) graph.push(faqNode(canonical, o.lang, o.faq));
  if (o.extra) graph.push(...o.extra);

  const dangling = findDanglingRefs(graph);
  if (dangling.length > 0) {
    console.warn(`[schema] ${canonical}: unresolved @id reference(s): ${dangling.join(', ')}`);
  }

  // "<" is escaped so the JSON can never terminate its own <script> element; the result is still valid JSON.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
