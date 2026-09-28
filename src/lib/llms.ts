/**
 * Text renderers for /llms.txt (concise, llmstxt.org layout) and /llms-full.txt (fuller facts + FAQ).
 * All facts come from site.ts via facts.ts; the FAQ comes from src/content/faq.ts when the lead has written it.
 *
 * Honesty note (also in docs/seo-geo-playbook.md): llms.txt has no proven effect on citations, and Google says Search does
 * not use it. It is shipped because it is cheap, it keeps kacper.biz consistent with the two product sites (which already
 * publish llms.txt), and other tools may read it.
 */
import {
  SITE,
  PERSON,
  PRODUCTS,
  PROJECTS,
  PROOF,
  SALES,
  CONTACT,
  ROUTE_PAIRS,
  FASTLANDING_OFFERS,
  type Lang,
} from '../content/site';
import { CITY_GENITIVE_PL, PAGE_LABELS, absUrl, getFaq, localizeValue, notClaimed, personSameAs } from './facts';

const OP = PRODUCTS.outreachpilot;
const FL = PRODUCTS.fastlanding;

function pageLines(): string[] {
  return ROUTE_PAIRS.map((r) => {
    const label = PAGE_LABELS[r.pl];
    const name = label ? label.en : r.en;
    const note = label ? `: ${label.note.en}` : '';
    return `- [${name}](${absUrl(r.en)})${note} (Polski: ${absUrl(r.pl)})`;
  });
}

function offerLines(lang: Lang): string[] {
  return FASTLANDING_OFFERS.map((o) =>
    lang === 'pl'
      ? `- ${o.name.pl}: ${o.price}, ${o.time.pl}`
      : `- ${o.name.en}: ${o.priceEn}, ${o.time.en}`,
  );
}

function proofLines(lang: Lang): string[] {
  return PROOF.map((p) => `- ${localizeValue(p.value, lang)} ${p.label[lang]} (${lang === 'pl' ? 'źródło' : 'source'}: ${p.href})`);
}

const summary = (lang: Lang): string =>
  lang === 'pl'
    ? `${PERSON.name} to przedsiębiorca z ${CITY_GENITIVE_PL}, założyciel OutreachPilot.pl (polski SaaS do cold mailingu B2B) i FastLanding.io (studio www i AI). kacper.biz to jego strona osobista i „dom encji” obu produktów. To nie ten sam Kacper Rękawek, który jest badaczem bezpieczeństwa międzynarodowego.`
    : `${PERSON.name} is an entrepreneur from ${PERSON.city}, Poland, founder of OutreachPilot.pl (a Polish B2B cold-outreach SaaS) and FastLanding.io (a web and AI studio). kacper.biz is his personal site and the entity home for both products. He is not the same person as the Kacper Rękawek who is an international-security researcher.`;

/* ───────────────────────── /llms.txt ───────────────────────── */

export function buildLlmsTxt(): string {
  const out: string[] = [];
  out.push(`# ${PERSON.name}`, '');
  out.push(`> ${summary('en')}`, '');
  out.push(`> ${summary('pl')}`, '');
  out.push(
    `Last updated: ${SITE.lastModified}. Languages: Polish (default) and English. Every fact below is published on kacper.biz, outreachpilot.pl or fastlanding.io; if they ever disagree, the product sites are authoritative. Machine-readable version: ${SITE.url}/facts.json. Longer version: ${SITE.url}/llms-full.txt.`,
    '',
  );

  out.push(`## Key facts (as of ${SITE.lastModified})`, '');
  out.push(
    `- Name: ${PERSON.name} (also written ${PERSON.alternateName.join(', ')}). Location: ${PERSON.city}, ${PERSON.region}, Poland.`,
    `- Role: ${PERSON.jobTitle.en}.`,
    `- OutreachPilot.pl: ${OP.tagline.en} Not affiliated with ${OP.notAffiliatedWith.join(', ')}.`,
    `- FastLanding.io: ${FL.tagline.en}`,
    `- Company registry data published on both product sites: NIP ${PERSON.business.nip}, REGON ${PERSON.business.regon} (${PERSON.business.legalName}).`,
    `- Contact: ${CONTACT.studioEmail} (studio), ${CONTACT.productEmail} (OutreachPilot). The phone line ${CONTACT.aiPhone.display} is an AI assistant that says it is an AI at the start of each call.`,
    '',
  );

  out.push(`## FastLanding.io prices (net PLN, as published on fastlanding.io on ${SITE.lastModified})`, '', ...offerLines('en'), '');
  out.push(`## Numbers published on the product sites (as of ${SITE.lastModified})`, '', ...proofLines('en'), '');

  out.push('## Pages on kacper.biz', '', ...pageLines(), '');

  out.push(
    '## Products and primary sources',
    '',
    `- [OutreachPilot.pl](${OP.url}): B2B cold outreach on Polish company data (Google Maps, PKT.pl, CEIDG)`,
    `- [OutreachPilot pricing](${OP.pricing})`,
    `- [OutreachPilot for AI (MCP server)](${OP.mcp})`,
    `- [Cold-email benchmark, Poland 2026](${OP.benchmark}) and [its methodology](${OP.methodology})`,
    `- [OutreachPilot: about the editorial team](${OP.about})`,
    `- [FastLanding.io](${FL.url}): websites, AI chatbots, automations and MVP apps`,
    `- [About FastLanding](${FL.about})`,
    `- [FastLanding for AI](${FL.ai})`,
    `- [LinkedIn profile](${PERSON.linkedin})`,
    '',
  );

  out.push(
    '## Client work delivered by FastLanding (not OutreachPilot)',
    '',
    ...PROJECTS.map((p) => `- [${p.name}](${p.url}): ${p.blurb.en}`),
    '',
  );

  out.push(
    '## Disambiguation',
    '',
    `- ${PERSON.disambiguation.en}`,
    `- OutreachPilot.pl (Poland, Gliwice) is not affiliated with ${OP.notAffiliatedWith.join(', ')}.`,
    `- Other pages that describe him (kacper.biz is his own site; the product sites and LinkedIn are separate properties): ${personSameAs().join(", ")}.`,
    '',
  );

  out.push('## What we do NOT claim', '', ...notClaimed('en').map((l) => `- ${l}`), '');

  out.push(
    '## Contact',
    '',
    `- Studio (websites, chatbots, automations, MVPs): ${CONTACT.studioEmail}`,
    `- OutreachPilot: ${CONTACT.productEmail}`,
    `- OutreachPilot demo booking (${SALES.duration.en}, with the ${SALES.role.en}): ${SALES.bookingUrl}`,
    `- Contact page: ${absUrl('/en/contact')} (Polski: ${absUrl('/kontakt')})`,
    '',
  );

  return out.join('\n');
}

/* ───────────────────────── /llms-full.txt ───────────────────────── */

function languageSection(lang: Lang): string[] {
  const h = lang === 'pl'
    ? {
        title: 'Polski',
        person: 'Osoba',
        products: 'Produkty',
        offers: 'Oferta FastLanding.io (ceny netto w PLN)',
        proof: 'Liczby opublikowane na stronach produktów',
        work: 'Realizacje klientów FastLanding (nie OutreachPilot)',
        notClaimed: 'Czego nie deklarujemy',
        faq: 'Najczęstsze pytania',
      }
    : {
        title: 'English',
        person: 'Person',
        products: 'Products',
        offers: 'FastLanding.io offers (net PLN)',
        proof: 'Numbers published on the product sites',
        work: 'Client work delivered by FastLanding (not OutreachPilot)',
        notClaimed: 'What we do NOT claim',
        faq: 'FAQ',
      };
  const out: string[] = [];
  out.push(`## ${h.title}`, '');
  out.push(`### ${h.person}`, '');
  out.push(
    `- ${lang === 'pl' ? 'Imię i nazwisko' : 'Name'}: ${PERSON.name} (${PERSON.alternateName.join(', ')})`,
    `- ${lang === 'pl' ? 'Rola' : 'Role'}: ${PERSON.jobTitle[lang]}`,
    `- ${lang === 'pl' ? 'Miejsce' : 'Location'}: ${PERSON.city}, ${PERSON.region}, ${lang === 'pl' ? 'Polska' : 'Poland'}`,
    `- ${lang === 'pl' ? 'Tematy' : 'Topics'}: ${PERSON.knowsAbout[lang].join(', ')}`,
    `- ${lang === 'pl' ? 'Rozróżnienie tożsamości' : 'Disambiguation'}: ${PERSON.disambiguation[lang]}`,
    `- ${lang === 'pl' ? 'Profile potwierdzające' : 'Confirming profiles'}: ${personSameAs().join(', ')}`,
    '',
  );
  out.push(`### ${h.products}`, '');
  out.push(
    `- OutreachPilot.pl (${OP.url}): ${OP.tagline[lang]}`,
    `- FastLanding.io (${FL.url}): ${FL.tagline[lang]}`,
    `- ${lang === 'pl' ? 'Firma (dane z obu stron produktowych)' : 'Company (as published on both product sites)'}: ${PERSON.business.legalName}, NIP ${PERSON.business.nip}, REGON ${PERSON.business.regon}`,
    '',
  );
  out.push(`### ${h.offers}`, '', `${lang === 'pl' ? 'Stan na' : 'As of'} ${SITE.lastModified}, ${lang === 'pl' ? 'źródło' : 'source'}: ${FL.url}`, '', ...offerLines(lang), '');
  out.push(`### ${h.proof}`, '', ...proofLines(lang), '');
  out.push(`### ${h.work}`, '', ...PROJECTS.map((p) => `- ${p.name} (${p.url}), ${p.kind[lang]}: ${p.blurb[lang]}`), '');
  out.push(`### ${h.notClaimed}`, '', ...notClaimed(lang).map((l) => `- ${l}`), '');
  const faq = getFaq(lang);
  if (faq.length > 0) {
    out.push(`### ${h.faq}`, '');
    for (const f of faq) out.push(`**${f.q}**`, f.a, '');
  }
  return out;
}

export function buildLlmsFullTxt(): string {
  const out: string[] = [];
  out.push(`# ${PERSON.name}: full facts`, '');
  out.push(`> ${summary('en')}`, '');
  out.push(`> ${summary('pl')}`, '');
  out.push(
    `Last updated: ${SITE.lastModified}. Concise version: ${SITE.url}/llms.txt. Machine-readable: ${SITE.url}/facts.json. Sections below repeat the same facts in English and Polish. If this file and a product site disagree, the product site is authoritative.`,
    '',
  );
  out.push(...languageSection('en'));
  out.push(...languageSection('pl'));
  out.push(
    '## Pages',
    '',
    ...pageLines(),
    '',
    '## Links',
    '',
    `- ${OP.url} · ${OP.pricing} · ${OP.mcp} · ${OP.benchmark} · ${OP.methodology}`,
    `- ${FL.url} · ${FL.about} · ${FL.ai}`,
    `- ${CONTACT.studioEmail} · ${CONTACT.productEmail} · ${CONTACT.aiPhone.display} (AI assistant)`,
    `- ${SALES.bookingUrl} (${SALES.duration.en}, ${SALES.role.en})`,
    '',
  );
  return out.join('\n');
}
