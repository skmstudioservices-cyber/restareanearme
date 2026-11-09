import type { APIRoute } from 'astro';
import { corridors } from '../lib/data';

const staticPages = ['/', '/rest-area-near-me/', '/rest-stop-near-me/', '/highway-rest-area-near-me/', '/about/', '/privacy/', '/methodology/'];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://restareanearme.pages.dev')).href.replace(/\/$/, '');
  const urls = [
    ...staticPages,
    ...corridors.map((c) => `/corridor/${c.slug}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
