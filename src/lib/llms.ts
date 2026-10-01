/**
 * Text renderers for /llms.txt (llmstxt.org layout) and /llms-full.txt (fuller facts, data tables and FAQ).
 * All facts come from site.ts / ceidg.ts via facts.ts; the FAQ comes from copy.ts (or src/content/faq.ts when present).
 *
 * llms.txt layout (checked by the SEO suite's validate_llms_txt.py): one H1, a blockquote summary, free text with the key
 * facts (no headings), then H2 sections that contain ONLY "- [label](https-url): note" items, each URL linked once,
 * and a final "## Optional" section. llms-full.txt is a plain long-form document and may use deeper headings.
 *
 * Honesty note (also in docs/seo-geo-playbook.md): llms.txt has no proven effect on citations, and Google says Search does
 * not use it. It is shipped because it is cheap to keep correct (generated from site.ts), it keeps kacper.biz consistent
 * with the two product sites (which publish llms.txt too), and other tools may read it.
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
  FASTLANDING_RECURRING,
  OUTREACHPILOT_PLANS,
  PRICES_CHECKED,
  BENCHMARK,
  type Lang,
} from '../content/site';
import { CITY_GENITIVE_PL, PAGE_LABELS, absUrl, getFaq, localizeValue, notClaimed, personSameAs } from './facts';

const OP = PRODUCTS.outreachpilot;
const FL = PRODUCTS.fastlanding;


/* ───────────────────────── shared lines ───────────────────────── */

function offerLines(lang: Lang): string[] {
  return FASTLANDING_OFFERS.map((o) =>
    lang === 'pl' ? `- ${o.name.pl}: ${o.price} netto, ${o.time.pl}` : `- ${o.name.en}: ${o.priceEn} net, ${o.time.en}`,
  );
}

function recurringLines(lang: Lang): string[] {
  return FASTLANDING_RECURRING.map((o) => (lang === 'pl' ? `- ${o.name.pl}: ${o.price} netto` : `- ${o.name.en}: ${o.priceEn} net`));
}

function planLines(lang: Lang): string[] {
  return OUTREACHPILOT_PLANS.items.map((p) => {
    const price =
      p.pricePLN === 0
        ? lang === 'pl' ? '0 zł' : 'PLN 0'
        : lang === 'pl' ? `${p.pricePLN} zł/mies.` : `PLN ${p.pricePLN}/month`;
    return `- ${p.name[lang]}: ${price} (${p.limits[lang]})`;
  });
}

function proofLines(lang: Lang): string[] {
  return PROOF.map((p) => `- ${localizeValue(p.value, lang)} ${p.label[lang]} (${lang === 'pl' ? 'źródło' : 'source'}: ${p.href})`);
}

function benchmarkLine(lang: Lang): string {
  return lang === 'pl'
    ? `- Benchmark kampanii użytkowników OutreachPilot (dane zamrożone ${BENCHMARK.frozen}): ${BENCHMARK.emails.pl} maili ze ${BENCHMARK.campaignsWithSends} kampanii z wysyłką (z ${BENCHMARK.campaignsTotal} uruchomionych), ${BENCHMARK.openRate.pl} otwarć, ${BENCHMARK.replyRate.pl} odpowiedzi, ${BENCHMARK.bounceRate.pl} odbić. Próba nie jest reprezentatywna dla całego rynku. Źródło: ${OP.benchmark}, metodologia: ${OP.methodology}.`
    : `- OutreachPilot user-campaign benchmark (data frozen ${BENCHMARK.frozen}): ${BENCHMARK.emails.en} emails from ${BENCHMARK.campaignsWithSends} campaigns that sent (of ${BENCHMARK.campaignsTotal} campaigns run), ${BENCHMARK.openRate.en} opens, ${BENCHMARK.replyRate.en} replies, ${BENCHMARK.bounceRate.en} bounces. The sample is not representative of the whole market. Source: ${OP.benchmark}, methodology: ${OP.methodology}.`;
}

const summary = (lang: Lang): string =>
  lang === 'pl'
    ? `${PERSON.name} to przedsiębiorca z ${CITY_GENITIVE_PL}, założyciel OutreachPilot.pl (polski SaaS do cold mailingu B2B na danych z CEIDG i Google Maps) i FastLanding.io (studio stron internetowych, chatbotów AI i aplikacji). kacper.biz to jego strona osobista i „dom encji” obu produktów. To inna osoba niż Kacper Rękawek, badacz bezpieczeństwa międzynarodowego.`
    : `${PERSON.name} is an entrepreneur from ${PERSON.city}, Poland, founder of OutreachPilot.pl (a Polish B2B cold-outreach SaaS built on CEIDG and Google Maps company data) and FastLanding.io (a studio for websites, AI chatbots and apps). kacper.biz is his personal site and the entity home for both products. He is a different person from the Kacper Rękawek who is an international-security researcher.`;

/* ───────────────────────── /llms.txt ───────────────────────── */

export function buildLlmsTxt(): string {
  const out: string[] = [];
  out.push(`# ${PERSON.name}`, '');
  out.push(`> ${summary('en')}`, '');
  out.push(summary('pl'), '');
  out.push(
    `Last updated: ${SITE.lastModified}. Languages: Polish (default) and English. Every fact below is also published on kacper.biz, outreachpilot.pl or fastlanding.io; if they ever disagree, the product sites are authoritative.`,
    '',
  );

  out.push(`**Key facts (as of ${SITE.lastModified})**`, '');
  out.push(
    `- Name: ${PERSON.name} (also written ${PERSON.alternateName.join(', ')}). Location: ${PERSON.city}, ${PERSON.region}, Poland.`,
    `- Role: ${PERSON.jobTitle.en}. He runs product and delivery; sales calls for both products are run by ${SALES.fullName}, Head of Sales.`,
    `- OutreachPilot.pl: ${OP.tagline.en} Not affiliated with ${OP.notAffiliatedWith.join(', ')}.`,
    `- FastLanding.io: ${FL.tagline.en} Not affiliated with ${FL.notAffiliatedWith.join(', ')}.`,
    `- Company registry data published on both product sites: ${PERSON.business.legalName}, NIP ${PERSON.business.nip}, REGON ${PERSON.business.regon}.`,
    `- ${PERSON.disambiguation.en}`,
    '',
  );

  out.push(`**OutreachPilot.pl plans (final prices in PLN, VAT-exempt seller, as published on ${OUTREACHPILOT_PLANS.source} on ${OUTREACHPILOT_PLANS.checked})**`, '');
  out.push(...planLines('en'), `- Every new account gets ${OUTREACHPILOT_PLANS.trialDays} days of the Pro plan with no card.`, '');

  out.push(`**FastLanding.io prices (net PLN, as published on ${FL.url} on ${PRICES_CHECKED.fastlanding})**`, '');
  out.push(...offerLines('en'), ...recurringLines('en'), '');

  out.push('**Numbers published on the product sites (each with its source and date)**', '');
  out.push(...proofLines('en'), benchmarkLine('en'), '');

  out.push('**What is not claimed**', '');
  out.push(...notClaimed('en').map((l) => `- ${l}`), '');

  out.push('**Contact**', '');
  out.push(
    `- Studio (websites, chatbots, automations, MVPs): ${CONTACT.studioEmail}. OutreachPilot: ${CONTACT.productEmail}. Replies within 24 hours on working days.`,
    `- The phone line ${CONTACT.aiPhone.display} is answered by an AI assistant that says it is an AI at the start of each call.`,
    '',
  );

  out.push(
    '## Pages on kacper.biz',
    '',
    ...ROUTE_PAIRS.map((r) => {
      const label = PAGE_LABELS[r.pl];
      const name = label ? label.en : r.en;
      const note = label ? label.note.en : 'page';
      return `- [${name}](${absUrl(r.en)}): ${note} (Polski: ${absUrl(r.pl)})`;
    }),
    '',
  );

  out.push(
    '## OutreachPilot.pl primary sources',
    '',
    `- [OutreachPilot.pl](${OP.url}/): B2B cold outreach on Polish company data (CEIDG, Google Maps, PKT.pl, OpenStreetMap), emails written by AI in Polish`,
    `- [OutreachPilot pricing](${OP.pricing}): current plans and limits`,
    `- [CEIDG statistics by sector and city](${OP.firms}): active registry entries per PKD code in 30 service sectors, refreshed regularly; the system of record for every registry number quoted on kacper.biz`,
    `- [Micro-businesses without a website, 2026](${OP.noWebsiteReport}): report, 3 in 100 list a website in CEIDG (sample 4,700, 7 Jul 2026)`,
    `- [Cold-email benchmark, Poland 2026](${OP.benchmark}): open, reply and bounce rates from user campaigns`,
    `- [Benchmark methodology](${OP.methodology}): how the benchmark sample was built`,
    `- [OutreachPilot for AI (MCP server)](${OP.mcp}): 39 tools for Claude and ChatGPT`,
    `- [About the editorial team and author](${OP.about}): Kacper Rękawek as author`,
    '',
  );

  out.push(
    '## FastLanding.io primary sources',
    '',
    `- [FastLanding.io](${FL.url}/): websites, AI chatbots, automations and MVP apps; prices and the quote form`,
    `- [FastBot AI chatbots](${FL.bot}): the chatbot product`,
    `- [About FastLanding](${FL.about}): the studio and its founder`,
    `- [FastLanding for AI](${FL.ai}): facts page for AI assistants`,
    '',
  );

  out.push(
    '## Client work delivered by FastLanding (not OutreachPilot)',
    '',
    ...PROJECTS.map((p) => `- [${p.name}](${p.url}): ${p.blurb.en}`),
    '',
  );

  out.push(
    '## Profiles',
    '',
    `- [LinkedIn](${PERSON.linkedin}): Kacper Rękawek's profile (linked with rel="me" from every page of kacper.biz)`,
    ...PERSON.extraSameAs.map((u) => `- [${new URL(u).hostname}](${u}): profile`),
    '',
  );

  out.push(
    '## Optional',
    '',
    `- [Full facts](${SITE.url}/llms-full.txt): the same facts in English and Polish, plus the FAQ`,
    `- [Machine-readable facts](${SITE.url}/facts.json): JSON with every fact, its source URL and date`,
    `- [Book a 30-minute call](${SALES.bookingUrl}): calendar of ${SALES.fullName}, Head of Sales`,
    '',
  );

  return out.join('\n');
}

/* ───────────────────────── /llms-full.txt ───────────────────────── */

function languageSection(lang: Lang): string[] {
  const pl = lang === 'pl';
  const h = pl
    ? {
        title: 'Polski',
        person: 'Osoba',
        products: 'Produkty',
        plans: `Plany OutreachPilot.pl (ceny końcowe w zł, sprzedawca zwolniony z VAT, stan na ${OUTREACHPILOT_PLANS.checked}, źródło: ${OUTREACHPILOT_PLANS.source})`,
        offers: `Oferta FastLanding.io (ceny netto w PLN, stan na ${PRICES_CHECKED.fastlanding}, źródło: ${FL.url})`,
        recurring: 'Usługi miesięczne i SEO',
        proof: 'Liczby opublikowane na stronach produktów',
        work: 'Realizacje klientów FastLanding (nie OutreachPilot)',
        notClaimed: 'Czego nie deklarujemy',
        faq: 'Najczęstsze pytania',
      }
    : {
        title: 'English',
        person: 'Person',
        products: 'Products',
        plans: `OutreachPilot.pl plans (final prices in PLN, VAT-exempt seller, as of ${OUTREACHPILOT_PLANS.checked}, source: ${OUTREACHPILOT_PLANS.source})`,
        offers: `FastLanding.io offers (net PLN, as of ${PRICES_CHECKED.fastlanding}, source: ${FL.url})`,
        recurring: 'Monthly services and SEO',
        proof: 'Numbers published on the product sites',
        work: 'Client work delivered by FastLanding (not OutreachPilot)',
        notClaimed: 'What we do NOT claim',
        faq: 'FAQ',
      };
  const out: string[] = [];
  out.push(`## ${h.title}`, '');
  out.push(`### ${h.person}`, '');
  out.push(
    `- ${pl ? 'Imię i nazwisko' : 'Name'}: ${PERSON.name} (${PERSON.alternateName.join(', ')})`,
    `- ${pl ? 'Rola' : 'Role'}: ${PERSON.jobTitle[lang]}`,
    `- ${pl ? 'Miejsce' : 'Location'}: ${PERSON.city}, ${PERSON.region}, ${pl ? 'Polska' : 'Poland'}`,
    `- ${pl ? 'Języki' : 'Languages'}: ${pl ? 'polski, angielski' : 'Polish, English'}`,
    `- ${pl ? 'Tematy' : 'Topics'}: ${PERSON.knowsAbout[lang].join(', ')}`,
    `- ${pl ? 'Sprzedaż' : 'Sales'}: ${pl ? `rozmowy sprzedażowe w obu firmach prowadzi ${SALES.fullName}, ${SALES.role.pl}` : `sales calls for both companies are run by ${SALES.fullName}, ${SALES.role.en}`}`,
    `- ${pl ? 'Rozróżnienie tożsamości' : 'Disambiguation'}: ${PERSON.disambiguation[lang]}`,
    `- ${pl ? 'Profile potwierdzające' : 'Confirming profiles'}: ${personSameAs().join(', ')}`,
    '',
  );
  out.push(`### ${h.products}`, '');
  out.push(
    `- OutreachPilot.pl (${OP.url}): ${OP.tagline[lang]}`,
    `- FastLanding.io (${FL.url}): ${FL.tagline[lang]}`,
    `- ${pl ? 'Firma (dane z obu stron produktowych)' : 'Company (as published on both product sites)'}: ${PERSON.business.legalName}, NIP ${PERSON.business.nip}, REGON ${PERSON.business.regon}`,
    `- ${pl ? `OutreachPilot.pl nie jest powiązany z ${OP.notAffiliatedWith.join(', ')}.` : `OutreachPilot.pl is not affiliated with ${OP.notAffiliatedWith.join(', ')}.`}`,
    `- ${pl ? `FastLanding.io nie jest powiązane z ${FL.notAffiliatedWith.join(', ')}.` : `FastLanding.io is not affiliated with ${FL.notAffiliatedWith.join(', ')}.`}`,
    '',
  );
  out.push(`### ${h.plans}`, '', ...planLines(lang));
  out.push(pl ? `- Każde nowe konto dostaje ${OUTREACHPILOT_PLANS.trialDays} dni planu Pro bez karty.` : `- Every new account gets ${OUTREACHPILOT_PLANS.trialDays} days of the Pro plan with no card.`, '');
  out.push(`### ${h.offers}`, '', ...offerLines(lang), '');
  out.push(`### ${h.recurring}`, '', ...recurringLines(lang), '');
  out.push(`### ${h.proof}`, '', ...proofLines(lang), benchmarkLine(lang), '');
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
    '## Registry statistics (CEIDG)',
    '',
    `- Current figures per sector and city: ${OP.firms}. The sector counts there are active CEIDG entries per PKD code; a business with several PKD codes counts in each sector, so the sector numbers must not be added up into a number of firms (the source page says so).`,
    `- Liczby dla branż i miast: ${OP.firms}. To aktywne wpisy w CEIDG z danym kodem PKD; firma z kilkoma kodami liczy się w każdej branży, więc liczb z branż nie należy sumować do liczby firm.`,
    '',
  );
  out.push(
    '## Pages',
    '',
    ...ROUTE_PAIRS.map((r) => {
      const label = PAGE_LABELS[r.pl];
      return `- ${label ? label.en : r.en}: ${absUrl(r.en)} (Polski: ${absUrl(r.pl)})${label ? `, ${label.note.en}` : ''}`;
    }),
    '',
    '## Links',
    '',
    `- ${OP.url} · ${OP.pricing} · ${OP.firms} · ${OP.noWebsiteReport} · ${OP.benchmark} · ${OP.methodology} · ${OP.mcp} · ${OP.about}`,
    `- ${FL.url} · ${FL.bot} · ${FL.about} · ${FL.ai}`,
    `- ${PERSON.linkedin}`,
    `- ${CONTACT.studioEmail} · ${CONTACT.productEmail} · ${CONTACT.aiPhone.display} (AI assistant)`,
    `- ${SALES.bookingUrl} (${SALES.duration.en}, ${SALES.role.en})`,
    '',
  );
  return out.join('\n');
}
