import { siteUrl } from '#lib/utils/paths';
import type { RequestHandler } from './$types';

export const prerender = __STATIC_DEMO__;

export const GET: RequestHandler = ({ url }) => {
	const pages = ['/', '/reservar', '/privacidad', '/terminos'];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((path) => `  <url><loc>${siteUrl(url.origin)}${path}</loc></url>`).join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'max-age=3600' }
	});
};
