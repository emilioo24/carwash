import { resolve } from '$app/paths';

/**
 * Antepone la subcarpeta del sitio a una ruta o archivo de static/.
 * En GitHub Pages el sitio vive en /<repo>/; en Cloudflare, en la raíz.
 */
export function withBase(path: string): string {
	if (/^https?:\/\//.test(path)) return path;
	return resolve('/').replace(/\/$/, '') + path;
}

/** URL pública del sitio, sin barra final. */
export function siteUrl(origin: string): string {
	return origin + withBase('');
}
