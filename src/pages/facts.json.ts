import type { APIRoute } from 'astro';
import { buildFactsDocument } from '../lib/facts';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildFactsDocument(), null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
