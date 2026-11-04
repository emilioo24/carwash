import cloudflareAdapter from '@sveltejs/adapter-cloudflare';
import staticAdapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
	// `pnpm build:demo`: sitio estático para GitHub Pages. El resto, Cloudflare.
	// Va por variable de entorno porque el prerender de Kit relee este archivo sin el --mode.
	if (mode === 'github-pages') process.env.STATIC_DEMO = '1';
	const demo = process.env.STATIC_DEMO === '1';

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				adapter: demo ? staticAdapter({ fallback: '404.html' }) : cloudflareAdapter(),
				inlineStyleThreshold: 40000,
				paths: {
					base: demo ? ((process.env.BASE_PATH ?? '') as '' | `/${string}`) : '',
					relative: false,
					...(demo && { origin: process.env.SITE_URL ?? 'http://localhost:4173' })
				},
				...(demo && {
					prerender: { entries: ['*' as const, '/sitemap.xml' as const, '/robots.txt' as const] }
				})
			})
		],
		define: {
			__STATIC_DEMO__: JSON.stringify(demo),
			__SHOW_SIMULATED__: JSON.stringify(demo || mode === 'development')
		},
		test: {
			include: ['tests/**/*.test.ts']
		}
	};
});
