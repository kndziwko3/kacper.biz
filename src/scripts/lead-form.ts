/**
 * Progressive enhancement for `form[data-lead]` (markup lives in src/components/ContactForm.astro).
 *
 *  - own validation (the form is `novalidate`) with friendly inline PL/EN errors, aria-invalid + aria-describedby
 *  - JSON POST to our own /api/lead (12 s timeout), with first-touch attribution + the render timestamp
 *  - success: confirmation, focus to the status region, form reset, reveal `[data-after]` (booking CTA)
 *  - server unavailable / not configured / network error: prefilled `mailto:` (opened + shown as a link)
 *
 * No third-party requests, no cookies, nothing stored. Idempotent: safe to call more than once.
 */
import { getAttribution } from './attribution';

type Lang = 'pl' | 'en';
type FieldName = 'need' | 'name' | 'email' | 'company' | 'message' | 'consent';
type ErrorCode = 'required' | 'too_short' | 'too_long' | 'invalid';
type FieldErrors = Partial<Record<FieldName, ErrorCode>>;
type StatusState = 'info' | 'ok' | 'err';

interface Values {
  need: string;
  name: string;
  email: string;
  company: string;
  message: string;
  consent: boolean;
}

const API_URL = '/api/lead';
const TIMEOUT_MS = 12_000;
/** The API silently drops submissions faster than 2.5 s; we wait instead of ever losing a real person's message. */
const MIN_FORM_AGE_MS = 2_600;
const MAILTO_BODY_MAX = 1_800;
const DEFAULT_MAILTO = 'kontakt@fastlanding.io';

const FIELD_ORDER: FieldName[] = ['need', 'name', 'email', 'company', 'message', 'consent'];
const NEEDS = ['outreach', 'website', 'chatbot', 'automation', 'app', 'other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Messages = Record<FieldName, Partial<Record<ErrorCode, string>>>;

interface Copy {
  generic: string;
  errors: Messages;
  sending: string;
  btnSending: string;
  ok: string;
  fixFields: (n: number) => string;
  rateLimited: (to: string) => string;
  fallback: (to: string) => string;
  fallbackLink: string;
  mail: { subject: string; need: string; name: string; email: string; site: string; message: string; footer: string };
}

const COPY: Record<Lang, Copy> = {
  pl: {
    generic: 'Sprawdź to pole.',
    errors: {
      need: { required: 'Wybierz, czego dotyczy zapytanie.', invalid: 'Wybierz, czego dotyczy zapytanie.' },
      name: {
        required: 'Podaj imię.',
        too_short: 'Imię musi mieć co najmniej 2 znaki.',
        too_long: 'Imię może mieć maksymalnie 100 znaków.',
      },
      email: {
        required: 'Podaj adres e-mail, na który mamy odpowiedzieć.',
        invalid: 'Ten adres e-mail wygląda na niepełny. Sprawdź go, proszę.',
        too_long: 'Adres e-mail jest za długi.',
      },
      company: {
        invalid: 'Podaj adres strony, np. twojafirma.pl, albo zostaw pole puste.',
        too_long: 'Adres strony może mieć maksymalnie 200 znaków.',
      },
      message: { too_long: 'Wiadomość może mieć maksymalnie 2000 znaków.' },
      consent: { required: 'Zaznacz to pole, aby wysłać zapytanie.' },
    },
    sending: 'Wysyłam…',
    btnSending: 'Wysyłanie…',
    ok: 'Wiadomość dotarła. Odpowiedź przyjdzie na podany adres e-mail.',
    fixFields: (n) => (n === 1 ? 'Popraw zaznaczone pole.' : 'Popraw zaznaczone pola.'),
    rateLimited: (to) => `Zbyt wiele prób z tego połączenia. Odczekaj kilka minut albo napisz na ${to}.`,
    fallback: (to) =>
      `Formularz nie mógł zostać wysłany przez serwer. Otwiera się Twój program pocztowy z gotową wiadomością do ${to}. Nic nie zostało jeszcze wysłane. Jeśli okno się nie pojawiło, użyj linku: `,
    fallbackLink: 'Otwórz gotową wiadomość e-mail',
    mail: {
      subject: 'Zapytanie z kacper.biz',
      need: 'Czego dotyczy',
      name: 'Imię',
      email: 'E-mail',
      site: 'Strona',
      message: 'Wiadomość',
      footer: 'Wysłano z formularza na kacper.biz',
    },
  },
  en: {
    generic: 'Please check this field.',
    errors: {
      need: { required: 'Choose what your enquiry is about.', invalid: 'Choose what your enquiry is about.' },
      name: {
        required: 'Please enter your name.',
        too_short: 'Your name needs at least 2 characters.',
        too_long: 'Your name can be at most 100 characters.',
      },
      email: {
        required: 'Please enter the email address we should reply to.',
        invalid: 'That email address looks incomplete. Please check it.',
        too_long: 'That email address is too long.',
      },
      company: {
        invalid: 'Enter a website address, e.g. yourcompany.com, or leave it empty.',
        too_long: 'The website address can be at most 200 characters.',
      },
      message: { too_long: 'The message can be at most 2000 characters.' },
      consent: { required: 'Tick this box to send your enquiry.' },
    },
    sending: 'Sending…',
    btnSending: 'Sending…',
    ok: 'Message received. The reply will go to the email address you entered.',
    fixFields: (n) => (n === 1 ? 'Please fix the highlighted field.' : 'Please fix the highlighted fields.'),
    rateLimited: (to) => `Too many attempts from this connection. Wait a few minutes or write to ${to}.`,
    fallback: (to) =>
      `The form could not be sent through the server. Your email app is opening with a ready-made message to ${to}. Nothing has been sent yet. If no window appeared, use this link: `,
    fallbackLink: 'Open the prepared email',
    mail: {
      subject: 'Enquiry from kacper.biz',
      need: 'Topic',
      name: 'Name',
      email: 'Email',
      site: 'Website',
      message: 'Message',
      footer: 'Sent from the form on kacper.biz',
    },
  },
};

// ── validation ──────────────────────────────────────────────────────────────

/** Same normalisation the API applies: "acme.pl" -> https://acme.pl; http/https only; no credentials. */
function normaliseUrl(raw: string): string | null {
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    if (!url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}

function checkField(name: FieldName, v: Values): ErrorCode | null {
  switch (name) {
    case 'need':
      return NEEDS.includes(v.need) ? null : 'required';
    case 'name': {
      const s = v.name.trim();
      if (!s) return 'required';
      if (s.length < 2) return 'too_short';
      return s.length > 100 ? 'too_long' : null;
    }
    case 'email': {
      const s = v.email.trim();
      if (!s) return 'required';
      if (s.length > 254) return 'too_long';
      return EMAIL_RE.test(s) ? null : 'invalid';
    }
    case 'company': {
      const s = v.company.trim();
      if (!s) return null;
      if (s.length > 200) return 'too_long';
      return normaliseUrl(s) ? null : 'invalid';
    }
    case 'message':
      return v.message.trim().length > 2000 ? 'too_long' : null;
    case 'consent':
      return v.consent ? null : 'required';
  }
}

function isFieldName(x: string): x is FieldName {
  return (FIELD_ORDER as string[]).includes(x);
}

function asErrorCode(x: unknown): ErrorCode {
  return x === 'required' || x === 'too_short' || x === 'too_long' || x === 'invalid' ? x : 'invalid';
}

// ── mailto fallback ─────────────────────────────────────────────────────────

/** encodeURIComponent throws on lone surrogates (possible with pasted text); replace them first. */
const wellFormed = (s: string): string => s.replace(/[\u{D800}-\u{DFFF}]/gu, '\u{FFFD}');
const encode = (s: string): string => encodeURIComponent(wellFormed(s).replace(/\r?\n/g, '\r\n'));

function buildMailto(to: string, lang: Lang, needLabel: string, v: Values): string {
  const m = COPY[lang].mail;
  const site = v.company.trim();
  const head = [
    `${m.need}: ${needLabel}`,
    `${m.name}: ${v.name.trim()}`,
    `${m.email}: ${v.email.trim()}`,
    site ? `${m.site}: ${site}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const tail = `-- ${m.footer}`;
  const compose = (message: string): string => `${head}\n\n${m.message}:\n${message}\n\n${tail}`;

  // Keep the *encoded* body under MAILTO_BODY_MAX so the whole URL stays inside common mail-client limits.
  let message = v.message.trim();
  if (encode(compose(message)).length >= MAILTO_BODY_MAX) {
    const chars = Array.from(wellFormed(message));
    let lo = 0;
    let hi = chars.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (encode(compose(`${chars.slice(0, mid).join('')}…`)).length < MAILTO_BODY_MAX) lo = mid;
      else hi = mid - 1;
    }
    message = `${chars.slice(0, lo).join('')}…`;
  }
  return `mailto:${to}?subject=${encodeURIComponent(`${m.subject}: ${needLabel}`)}&body=${encode(compose(message))}`;
}

// ── per-form controller ─────────────────────────────────────────────────────

interface Ctx {
  form: HTMLFormElement;
  lang: Lang;
  mailto: string;
  status: HTMLElement;
  submit: HTMLButtonElement;
  label: HTMLElement | null;
  idleLabel: string;
  after: HTMLElement | null;
  tsField: HTMLInputElement | null;
  hpField: HTMLInputElement | null;
  t0: number;
  sending: boolean;
  errors: FieldErrors;
}

type Outcome =
  | { kind: 'ok' }
  | { kind: 'validation'; fields: FieldErrors }
  | { kind: 'stale' }
  | { kind: 'rate' }
  | { kind: 'fallback' };

function field<T extends HTMLElement>(form: HTMLFormElement, name: string): T | null {
  return form.querySelector<T>(`[name="${name}"]`);
}

function readValues(form: HTMLFormElement): Values {
  return {
    need: form.querySelector<HTMLInputElement>('input[name="need"]:checked')?.value ?? '',
    name: field<HTMLInputElement>(form, 'name')?.value ?? '',
    email: field<HTMLInputElement>(form, 'email')?.value ?? '',
    company: field<HTMLInputElement>(form, 'company')?.value ?? '',
    message: field<HTMLTextAreaElement>(form, 'message')?.value ?? '',
    consent: field<HTMLInputElement>(form, 'consent')?.checked ?? false,
  };
}

function controlsOf(ctx: Ctx, name: FieldName): HTMLElement[] {
  return Array.from(ctx.form.querySelectorAll<HTMLElement>(`[name="${name}"]`));
}

function showFieldError(ctx: Ctx, name: FieldName, code: ErrorCode | null): void {
  const box = ctx.form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  const errorEl = ctx.form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  const controls = controlsOf(ctx, name);
  if (code) {
    ctx.errors[name] = code;
    if (errorEl) {
      errorEl.textContent = COPY[ctx.lang].errors[name][code] ?? COPY[ctx.lang].generic;
      errorEl.hidden = false;
    }
    controls.forEach((c) => c.setAttribute('aria-invalid', 'true'));
    box?.setAttribute('data-invalid', '');
  } else {
    delete ctx.errors[name];
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
    controls.forEach((c) => c.removeAttribute('aria-invalid'));
    box?.removeAttribute('data-invalid');
  }
}

function clearAllErrors(ctx: Ctx): void {
  FIELD_ORDER.forEach((n) => showFieldError(ctx, n, null));
}

function focusField(ctx: Ctx, name: FieldName): void {
  controlsOf(ctx, name)[0]?.focus();
}

function setStatus(ctx: Ctx, state: StatusState, text: string): void {
  ctx.status.setAttribute('data-state', state);
  ctx.status.textContent = text;
}

function setBusy(ctx: Ctx, busy: boolean): void {
  ctx.sending = busy;
  ctx.submit.disabled = busy;
  ctx.form.setAttribute('aria-busy', busy ? 'true' : 'false');
  if (ctx.label) ctx.label.textContent = busy ? COPY[ctx.lang].btnSending : ctx.idleLabel;
}

/** New "form rendered" moment for the API's timing check. */
function stamp(ctx: Ctx): void {
  ctx.t0 = performance.now();
  if (ctx.tsField) ctx.tsField.value = String(Date.now());
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

async function post(ctx: Ctx, values: Values): Promise<Outcome> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const payload = {
      need: values.need,
      name: values.name.trim(),
      email: values.email.trim(),
      company: values.company.trim(),
      message: values.message.trim(),
      consent: true,
      hp: ctx.hpField?.value ?? '',
      ts: Number(ctx.tsField?.value),
      elapsed: Math.round(performance.now() - ctx.t0),
      lang: ctx.lang,
      attribution: getAttribution(),
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    const d = (data && typeof data === 'object' ? data : {}) as { ok?: unknown; error?: unknown; fields?: unknown };

    if (res.ok && d.ok === true) return { kind: 'ok' };
    if (res.status === 400 && d.error === 'stale_form') return { kind: 'stale' };
    if (res.status === 400 && d.error === 'validation' && d.fields && typeof d.fields === 'object') {
      const fields: FieldErrors = {};
      for (const [key, code] of Object.entries(d.fields as Record<string, unknown>)) {
        if (isFieldName(key)) fields[key] = asErrorCode(code);
      }
      if (Object.keys(fields).length > 0) return { kind: 'validation', fields };
    }
    if (res.status === 429) return { kind: 'rate' };
    // 502/503 (delivery failed / not configured), 404 (no function, e.g. `astro dev`), 403/413/415, HTML from a proxy…
    return { kind: 'fallback' };
  } catch {
    return { kind: 'fallback' }; // network error, or aborted by the 12 s timeout
  } finally {
    window.clearTimeout(timer);
  }
}

function showFallback(ctx: Ctx, values: Values): void {
  const needLabel =
    ctx.form.querySelector<HTMLElement>('input[name="need"]:checked + span')?.textContent?.trim() || values.need;
  const href = buildMailto(ctx.mailto, ctx.lang, needLabel, values);
  const copy = COPY[ctx.lang];

  ctx.status.setAttribute('data-state', 'err');
  ctx.status.textContent = copy.fallback(ctx.mailto);
  const link = document.createElement('a');
  link.href = href;
  link.textContent = copy.fallbackLink;
  ctx.status.appendChild(link);
  ctx.status.focus();

  try {
    window.location.href = href; // may be blocked without a fresh user gesture; the visible link is the safety net
  } catch {
    /* ignore */
  }
}

async function handleSubmit(ctx: Ctx): Promise<void> {
  if (ctx.sending) return;

  const values = readValues(ctx.form);
  const errors: FieldErrors = {};
  for (const name of FIELD_ORDER) {
    const code = checkField(name, values);
    if (code) errors[name] = code;
    showFieldError(ctx, name, code);
  }
  const invalid = FIELD_ORDER.filter((n) => errors[n]);
  if (invalid.length > 0) {
    setStatus(ctx, 'err', COPY[ctx.lang].fixFields(invalid.length));
    focusField(ctx, invalid[0] as FieldName);
    return;
  }

  setBusy(ctx, true);
  setStatus(ctx, 'info', COPY[ctx.lang].sending);

  let outcome: Outcome = { kind: 'fallback' };
  for (let attempt = 0; attempt < 2; attempt++) {
    const wait = MIN_FORM_AGE_MS - (performance.now() - ctx.t0);
    if (wait > 0) await sleep(wait);
    outcome = await post(ctx, values);
    if (outcome.kind === 'stale' && attempt === 0) {
      stamp(ctx); // form was open > 2 h: re-stamp and retry once, invisibly
      continue;
    }
    break;
  }

  setBusy(ctx, false);

  switch (outcome.kind) {
    case 'ok':
      ctx.form.reset();
      clearAllErrors(ctx);
      stamp(ctx);
      setStatus(ctx, 'ok', COPY[ctx.lang].ok);
      if (ctx.after) ctx.after.hidden = false;
      ctx.status.focus();
      break;
    case 'validation': {
      const fields = outcome.fields;
      for (const name of FIELD_ORDER) showFieldError(ctx, name, fields[name] ?? null);
      const first = FIELD_ORDER.find((n) => fields[n]);
      setStatus(ctx, 'err', COPY[ctx.lang].fixFields(Object.keys(fields).length));
      if (first) focusField(ctx, first);
      break;
    }
    case 'rate':
      setStatus(ctx, 'err', COPY[ctx.lang].rateLimited(ctx.mailto));
      ctx.status.focus();
      break;
    case 'stale':
    case 'fallback':
      showFallback(ctx, values);
      break;
  }
}

function enhance(form: HTMLFormElement): void {
  if (form.dataset.enhanced === 'true') return;
  const status = form.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!status || !submit) return; // markup not as expected: leave the form alone

  const mailtoAttr = (form.dataset.mailto || '').trim();
  const ctx: Ctx = {
    form,
    lang: form.dataset.lang === 'en' ? 'en' : 'pl',
    mailto: /^[^\s@?&]+@[^\s@?&]+$/.test(mailtoAttr) ? mailtoAttr : DEFAULT_MAILTO,
    status,
    submit,
    label: submit.querySelector<HTMLElement>('[data-label]'),
    idleLabel: '',
    after: (form.closest('[data-lead-wrap]') ?? form.parentElement)?.querySelector<HTMLElement>('[data-after]') ?? null,
    tsField: field<HTMLInputElement>(form, 'ts'),
    hpField: field<HTMLInputElement>(form, 'hp'),
    t0: performance.now(),
    sending: false,
    errors: {},
  };
  ctx.idleLabel = ctx.label?.textContent ?? '';
  form.dataset.enhanced = 'true';
  form.noValidate = true;
  stamp(ctx);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleSubmit(ctx);
  });

  // Fix-as-you-type: once a field shows an error, re-check it on every change and clear the message when it is fine.
  const recheck = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const name = target.getAttribute('name');
    if (!name || !isFieldName(name) || !ctx.errors[name]) return;
    showFieldError(ctx, name, checkField(name, readValues(form)));
  };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);

  // Validate a text field when the person leaves it, but never nag an untouched empty field.
  form.addEventListener('focusout', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const name = target.getAttribute('name');
    if (!name || !isFieldName(name) || name === 'need' || name === 'consent') return;
    if (target.value.trim() === '' && !ctx.errors[name]) return;
    showFieldError(ctx, name, checkField(name, readValues(form)));
  });
}

export function initLeadForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-lead]').forEach(enhance);
}
