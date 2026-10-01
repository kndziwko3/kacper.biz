/**
 * Registry numbers published on outreachpilot.pl/firmy ("Dane CEIDG, aktualizacja 1 października 2026"), read on
 * 2026-10-02; the 30 sector counts sum exactly to the published total (3 702 470).
 * A count is the number of ACTIVE CEIDG ENTRIES carrying that PKD code (nationwide), or carrying any of the 30 codes
 * (per city). It is not a number of firms: an entry with several PKD codes counts in each sector, so the sectors
 * overlap and must never be summed or called "firms" on the page.
 * There is no sector x city breakdown here on purpose: we only show numbers that are published.
 */
import type { L10n } from './site';

export const CEIDG = {
  date: '2026-10-01',
  /** entries across the 30 sectors (overlapping), not firms */
  total: 3702470,
  source: 'https://outreachpilot.pl/firmy',
} as const;

export interface Sector { slug: string; pkd: string; count: number; name: L10n }
export interface City { slug: string; count: number; name: string; /** genitive, with preposition: "z Krakowa" */ from: string; /** locative: "w Krakowie" */ in: string; lat: number; lon: number }

/** Sorted by count, descending. */
export const SECTORS: Sector[] = [
  { slug: 'firmy-budowlane', pkd: '41.20.Z', count: 363718, name: { pl: 'Firmy budowlane', en: 'Construction firms' } },
  { slug: 'malarze', pkd: '43.34.Z', count: 270316, name: { pl: 'Malarze i tapeciarze', en: 'Painters and decorators' } },
  { slug: 'stolarze', pkd: '43.32.Z', count: 267720, name: { pl: 'Stolarze', en: 'Carpenters' } },
  { slug: 'transport-towarowy', pkd: '49.41.Z', count: 264728, name: { pl: 'Transport towarowy', en: 'Road freight' } },
  { slug: 'sklepy-internetowe', pkd: '47.91.Z', count: 249866, name: { pl: 'Sklepy internetowe', en: 'Online shops' } },
  { slug: 'elektrycy', pkd: '43.21.Z', count: 247673, name: { pl: 'Elektrycy', en: 'Electricians' } },
  { slug: 'hydraulicy', pkd: '43.22.Z', count: 236688, name: { pl: 'Hydraulicy', en: 'Plumbers' } },
  { slug: 'doradcy-biznesowi', pkd: '70.22.Z', count: 186992, name: { pl: 'Doradcy biznesowi', en: 'Business consultants' } },
  { slug: 'agencje-reklamowe', pkd: '73.11.Z', count: 163019, name: { pl: 'Agencje reklamowe', en: 'Advertising agencies' } },
  { slug: 'mechanicy-samochodowi', pkd: '45.20.Z', count: 162301, name: { pl: 'Mechanicy samochodowi', en: 'Car mechanics' } },
  { slug: 'dekarze', pkd: '43.91.Z', count: 147201, name: { pl: 'Dekarze', en: 'Roofers' } },
  { slug: 'projektanci-i-graficy', pkd: '74.10.Z', count: 121213, name: { pl: 'Projektanci i graficy', en: 'Designers' } },
  { slug: 'programisci', pkd: '62.01.Z', count: 105718, name: { pl: 'Programiści', en: 'Software developers' } },
  { slug: 'fotografowie', pkd: '74.20.Z', count: 96932, name: { pl: 'Fotografowie', en: 'Photographers' } },
  { slug: 'firmy-ogrodnicze', pkd: '81.30.Z', count: 94268, name: { pl: 'Firmy ogrodnicze', en: 'Landscaping' } },
  { slug: 'firmy-sprzatajace', pkd: '81.21.Z', count: 81743, name: { pl: 'Firmy sprzątające', en: 'Cleaning companies' } },
  { slug: 'fryzjerzy-i-kosmetyka', pkd: '96.02.Z', count: 71078, name: { pl: 'Fryzjerzy i kosmetyka', en: 'Hair and beauty' } },
  { slug: 'posrednicy-nieruchomosci', pkd: '68.31.Z', count: 64086, name: { pl: 'Pośrednicy nieruchomości', en: 'Estate agents' } },
  { slug: 'kancelarie-prawne', pkd: '69.10.Z', count: 62319, name: { pl: 'Kancelarie prawne', en: 'Law offices' } },
  { slug: 'architekci', pkd: '71.11.Z', count: 61327, name: { pl: 'Architekci', en: 'Architects' } },
  { slug: 'taksowkarze', pkd: '49.32.Z', count: 60942, name: { pl: 'Taksówkarze', en: 'Taxi drivers' } },
  { slug: 'firmy-cateringowe', pkd: '56.21.Z', count: 55037, name: { pl: 'Firmy cateringowe', en: 'Caterers' } },
  { slug: 'zarzadcy-nieruchomosci', pkd: '68.32.Z', count: 49257, name: { pl: 'Zarządcy nieruchomości', en: 'Property managers' } },
  { slug: 'fizjoterapeuci', pkd: '86.90.A', count: 45365, name: { pl: 'Fizjoterapeuci', en: 'Physiotherapists' } },
  { slug: 'tlumacze', pkd: '74.30.Z', count: 43244, name: { pl: 'Tłumacze', en: 'Translators' } },
  { slug: 'restauracje', pkd: '56.10.A', count: 42346, name: { pl: 'Restauracje', en: 'Restaurants' } },
  { slug: 'dentysci', pkd: '86.23.Z', count: 33743, name: { pl: 'Dentyści', en: 'Dentists' } },
  { slug: 'biura-rachunkowe', pkd: '69.20.Z', count: 30837, name: { pl: 'Biura rachunkowe', en: 'Accounting offices' } },
  { slug: 'szkoly-jazdy', pkd: '85.53.Z', count: 12080, name: { pl: 'Szkoły jazdy', en: 'Driving schools' } },
  { slug: 'weterynarze', pkd: '75.00.Z', count: 10713, name: { pl: 'Weterynarze', en: 'Vets' } },
];

/** Top 16 cities as published (all 30 sectors combined). Coordinates are city centres, for the map marker only. */
export const CITIES: City[] = [
  { slug: 'warszawa', count: 241209, name: 'Warszawa', from: 'z Warszawy', in: 'w Warszawie', lat: 52.2297, lon: 21.0122 },
  { slug: 'krakow', count: 96534, name: 'Kraków', from: 'z Krakowa', in: 'w Krakowie', lat: 50.0647, lon: 19.945 },
  { slug: 'wroclaw', count: 76169, name: 'Wrocław', from: 'z Wrocławia', in: 'we Wrocławiu', lat: 51.1079, lon: 17.0385 },
  { slug: 'poznan', count: 71982, name: 'Poznań', from: 'z Poznania', in: 'w Poznaniu', lat: 52.4064, lon: 16.9252 },
  { slug: 'lodz', count: 60556, name: 'Łódź', from: 'z Łodzi', in: 'w Łodzi', lat: 51.7592, lon: 19.456 },
  { slug: 'gdansk', count: 46401, name: 'Gdańsk', from: 'z Gdańska', in: 'w Gdańsku', lat: 54.352, lon: 18.6466 },
  { slug: 'szczecin', count: 42200, name: 'Szczecin', from: 'ze Szczecina', in: 'w Szczecinie', lat: 53.4285, lon: 14.5528 },
  { slug: 'lublin', count: 29250, name: 'Lublin', from: 'z Lublina', in: 'w Lublinie', lat: 51.2465, lon: 22.5684 },
  { slug: 'katowice', count: 28118, name: 'Katowice', from: 'z Katowic', in: 'w Katowicach', lat: 50.2649, lon: 19.0238 },
  { slug: 'bialystok', count: 24259, name: 'Białystok', from: 'z Białegostoku', in: 'w Białymstoku', lat: 53.1325, lon: 23.1688 },
  { slug: 'bydgoszcz', count: 23864, name: 'Bydgoszcz', from: 'z Bydgoszczy', in: 'w Bydgoszczy', lat: 53.1235, lon: 18.0084 },
  { slug: 'gdynia', count: 22096, name: 'Gdynia', from: 'z Gdyni', in: 'w Gdyni', lat: 54.5189, lon: 18.5305 },
  { slug: 'rzeszow', count: 18762, name: 'Rzeszów', from: 'z Rzeszowa', in: 'w Rzeszowie', lat: 50.0412, lon: 21.9991 },
  { slug: 'czestochowa', count: 17119, name: 'Częstochowa', from: 'z Częstochowy', in: 'w Częstochowie', lat: 50.8118, lon: 19.1203 },
  { slug: 'torun', count: 15754, name: 'Toruń', from: 'z Torunia', in: 'w Toruniu', lat: 53.0138, lon: 18.5984 },
  { slug: 'radom', count: 13371, name: 'Radom', from: 'z Radomia', in: 'w Radomiu', lat: 51.4027, lon: 21.1471 },
];

export const sectorUrl = (s: Sector) => `https://outreachpilot.pl/firmy/${s.slug}`;
export const cityUrl = (c: City) => `https://outreachpilot.pl/firmy/miasta/${c.slug}`;

/** "3 181 616" with non-breaking thin grouping (PL) or "3,181,616" (EN). */
export const fmt = (n: number, lang: 'pl' | 'en') =>
  lang === 'pl' ? n.toLocaleString('pl-PL').replace(/\s/g, ' ') : n.toLocaleString('en-US');
