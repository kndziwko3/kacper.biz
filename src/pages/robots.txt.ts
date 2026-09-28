import type { APIRoute } from 'astro';
import { SITE } from '../content/site';

/**
 * robots.txt, generated at build so the sitemap URL and the disallow list live next to the rest of the site config.
 *
 * Policy: kacper.biz is a lead-gen personal brand. Being findable AND being in model memory is the point, so every
 * search crawler, user-triggered fetcher and training crawler is welcome. To opt out of training later, flip the
 * TRAINING list below to `Disallow: /` (search + user-fetch bots are separate agents and keep working).
 *
 * RFC 9309 detail: a crawler that matches a specific `User-agent` group IGNORES the `*` group entirely, so the
 * Disallow rules are repeated inside every named group instead of relying on `*` inheritance.
 */

/** Crawlers that index for search / power citations in answer engines. */
const SEARCH_BOTS = [
  'Googlebot',
  'Bingbot', // Bing's index is the retrieval layer behind ChatGPT search and Copilot
  'OAI-SearchBot', // ChatGPT search index
  'Claude-SearchBot', // Claude search index
  'PerplexityBot', // Perplexity search index
  'Applebot', // Siri / Spotlight
] as const;

/** Fetchers that run when a person asks an assistant to open a page. */
const USER_BOTS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User'] as const;

/**
 * Training / model-memory crawlers and control tokens. Allowed on purpose (see file header).
 * CCBot (Common Crawl) is the judgement call: its corpus feeds many third-party models, which is exactly the
 * "be in model memory" goal for a lead-gen brand, and the pages contain nothing private.
 */
const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'] as const;

const DISALLOW = ['/api/', '/lab'] as const;

const group = (agents: readonly string[], comment: string): string =>
  [
    `# ${comment}`,
    ...agents.map((a) => `User-agent: ${a}`),
    'Allow: /',
    ...DISALLOW.map((d) => `Disallow: ${d}`),
    '',
  ].join('\n');

export const GET: APIRoute = () => {
  const body = [
    `# robots.txt for ${SITE.domain}`,
    '# Every crawler below is explicitly welcome; only the form API and the /lab sandbox are off limits.',
    '',
    group(SEARCH_BOTS, 'Search and answer-engine indexers'),
    group(USER_BOTS, 'Assistants fetching a page on behalf of a user'),
    group(TRAINING_BOTS, 'Training crawlers / control tokens: allowed on purpose, a lead-gen brand wants to be in model memory'),
    '# Everyone else',
    'User-agent: *',
    'Allow: /',
    ...DISALLOW.map((d) => `Disallow: ${d}`),
    '',
    `Sitemap: ${SITE.url}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
