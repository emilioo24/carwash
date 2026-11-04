import { mkdir, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

// Debe coincidir con VARIANT_WIDTHS en src/lib/utils/images.ts
export const VARIANT_WIDTHS = [480, 720, 960, 1440];
export const OPT_DIR = join('static', 'img', '_opt');

const modifiedAt = (path: string) =>
	stat(path).then(
		(info) => info.mtimeMs,
		() => 0
	);

/**
 * Genera las variantes AVIF y WebP de una imagen.
 * El nombre de salida es `<nombre>-<ancho>.<formato>`.
 * Las que ya están al día no se vuelven a generar.
 */
export async function buildVariants(sourcePath: string): Promise<void> {
	await mkdir(OPT_DIR, { recursive: true });
	const name = basename(sourcePath, extname(sourcePath));
	const sourceTime = await modifiedAt(sourcePath);

	for (const width of VARIANT_WIDTHS) {
		const resized = () =>
			sharp(sourcePath).rotate().resize({ width, withoutEnlargement: true });

		const avif = join(OPT_DIR, `${name}-${width}.avif`);
		if ((await modifiedAt(avif)) < sourceTime) {
			await resized().avif({ quality: 52, effort: 4 }).toFile(avif);
		}

		const webp = join(OPT_DIR, `${name}-${width}.webp`);
		if ((await modifiedAt(webp)) < sourceTime) {
			await resized().webp({ quality: 74, effort: 5 }).toFile(webp);
		}
	}
}
