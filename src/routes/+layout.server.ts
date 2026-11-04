import { getSettings } from '#lib/server/repositories';
import type { LayoutServerLoad } from './$types';

// En la demo de GitHub Pages todo el sitio se genera al compilar.
export const prerender = __STATIC_DEMO__;

export const load: LayoutServerLoad = async () => {
	return { settings: await getSettings() };
};
