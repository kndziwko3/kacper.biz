/**
 * Polish micro-typography, applied to every copy string at build time.
 * - no single-letter word at a line end (a, i, o, u, w, z and capitals): the space after it becomes a no-break space
 * - numbers stay glued to their units and to their thousand groups ("1 499 zł", "7 dni", "30 minut")
 * - em dashes are banned in copy; this throws in dev so they cannot sneak back in
 * Strings may contain simple inline HTML (<strong>, <br>): the regexes never touch text inside tags.
 */
const NBSP = ' ';
const WJ = '\u2060'; // word joiner

const SINGLE = /(^|[\s(„>])([aiouwzAIOUWZ])\s+/g;
const THOUSANDS = /(\d)[   ](\d{3})(?!\d)/g;
const UNITS = /(\d)\s+(zł|PLN|dni|dnia|min|minut|godzin|h|%|×|mies\.|osób|firm|maili|kampanii|wpisów|narzędzi|leadów|wiadomości|znaków|zł\/mies\.|m²)(?=[\s.,;:)!? ]|$)/g;
const RANGE = /(\d)–(?!\u2060)(\d)/g;
const PREFIX_UNITS = /\b(od|do|ok\.|nr|str\.|PLN|USD|GBP|€|\$)\s+(?=\d)/g;
const SHORT_WORDS_PL = /(^|[\s(„>])(do|od|na|po|we|ze|ku|co|to|że|by|go|mu|mi|ci|Ci|się|nie|lub|oraz|jak|bez|dla|pod|nad|przy)\s+(?=\S)/g;

function onTextOnly(input: string, fn: (s: string) => string): string {
  // split on tags, transform only the text parts
  return input.split(/(<[^>]+>)/g).map((part) => (part.startsWith('<') ? part : fn(part))).join('');
}

export function typo(input: string, lang: 'pl' | 'en' = 'pl'): string {
  if (import.meta.env?.DEV && input.includes('—')) {
    throw new Error(`Em dash in copy: "${input.slice(0, 80)}"`);
  }
  return onTextOnly(input, (s) => {
    let out = s;
    // run twice so consecutive single letters ("a w", "i z") are both caught
    if (lang === 'pl') {
      out = out.replace(SINGLE, `$1$2${NBSP}`).replace(SINGLE, `$1$2${NBSP}`);
      out = out.replace(SHORT_WORDS_PL, (m, pre: string, w: string) => (w.length <= 2 ? `${pre}${w}${NBSP}` : m));
    }
    out = out.replace(THOUSANDS, `$1${NBSP}$2`).replace(THOUSANDS, `$1${NBSP}$2`);
    out = out.replace(UNITS, `$1${NBSP}$2`);
    out = out.replace(PREFIX_UNITS, `$1${NBSP}`);
    // numeric ranges ("7–14 dni") never break at the dash
    out = out.replace(RANGE, `$1–${WJ}$2`);
    return out;
  });
}

/** Deep-apply typo() to every string in a copy object (arrays and nested objects included). */
export function typoDeep<T>(value: T, lang: 'pl' | 'en'): T {
  if (typeof value === 'string') return typo(value, lang) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => typoDeep(v, lang)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // URLs, emails, ids and machine keys are left untouched
      if (/^(href|url|slug|key|id|email|tel|src|pkd|host)$/i.test(k)) out[k] = v;
      // <title> and meta description: keep no-break spaces, drop the invisible word joiner
      else if (/^(title|description)$/.test(k) && typeof v === 'string') out[k] = typo(v, lang).replace(/\u2060/g, '');
      else out[k] = typoDeep(v, lang);
    }
    return out as T;
  }
  return value;
}
