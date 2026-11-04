import { withBase } from '#lib/utils/paths';

// Debe coincidir con VARIANT_WIDTHS en scripts/lib/images.ts
export const VARIANT_WIDTHS = [480, 720, 960, 1440] as const;

export interface PictureSources {
	avif: string | null;
	webp: string | null;
	fallback: string;
}

/**
 * Único punto que sabe dónde están las variantes de una imagen.
 * Con Supabase Storage, las URLs absolutas se resuelven acá sin tocar componentes.
 */
export function pictureSources(src: string): PictureSources {
	if (/^https?:\/\//.test(src)) return { avif: null, webp: null, fallback: src };

	const name = src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
	const srcset = (format: 'avif' | 'webp') =>
		VARIANT_WIDTHS.map((width) => `${withBase(`/img/_opt/${name}-${width}.${format}`)} ${width}w`).join(', ');

	return {
		avif: srcset('avif'),
		webp: srcset('webp'),
		fallback: withBase(`/img/_opt/${name}-960.webp`)
	};
}
