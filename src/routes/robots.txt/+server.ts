import { siteUrl } from '#lib/utils/paths';
import type { RequestHandler } from './$types';

export const prerender = __STATIC_DEMO__;

export const GET: RequestHandler = ({ url }) => {
	const body = __STATIC_DEMO__
		? 'User-agent: *\nDisallow: /\n'
		: `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl(url.origin)}/sitemap.xml
`;

	return new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'max-age=3600' }
	});
};
