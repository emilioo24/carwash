/**
 * pnpm gallery:sync
 *
 * Escanea static/img/trabajos/{autos,camionetas}/, empareja los archivos
 * <nombre>-antes y <nombre>-despues, genera las variantes optimizadas y
 * reescribe src/lib/data/gallery.ts.
 *
 * Un `-despues` sin `-antes` se publica con before: null.
 * Un `-antes` sin `-despues` se avisa y no se publica.
 * Un `-antes-simulado` solo se usa si no hay `-antes` real, y solo se ve en la demo.
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { buildVariants } from './lib/images.ts';

const ROOT = join('static', 'img', 'trabajos');
const OUTPUT = join('src', 'lib', 'data', 'gallery.ts');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const FOLDERS: Record<string, string> = { autos: 'auto', camionetas: 'camioneta' };
const ACRONYMS = new Set(['cla', 'suv', 'vw', 'bmw', 'gt', 'gti']);

interface Pair {
	before?: string;
	simulatedBefore?: string;
	after?: string;
	vehicleType: string;
	slug: string;
}

function toTitle(slug: string): string {
	return slug
		.split('-')
		.map((word, index) => {
			if (ACRONYMS.has(word)) return word.toUpperCase();
			return index === 0 ? word[0].toUpperCase() + word.slice(1) : word;
		})
		.join(' ');
}

async function exists(path: string): Promise<boolean> {
	return stat(path).then(
		() => true,
		() => false
	);
}

async function scan(): Promise<Pair[]> {
	const pairs = new Map<string, Pair>();

	for (const [folder, vehicleType] of Object.entries(FOLDERS)) {
		const directory = join(ROOT, folder);
		if (!(await exists(directory))) continue;

		for (const file of (await readdir(directory)).sort()) {
			const extension = extname(file).toLowerCase();
			if (!EXTENSIONS.has(extension)) continue;

			const match = file.slice(0, -extension.length).match(/^(.+)-(antes-simulado|antes|despues)$/);
			if (!match) {
				console.warn(`Ignorado (falta -antes o -despues): ${folder}/${file}`);
				continue;
			}

			const [, slug, kind] = match;
			const pair = pairs.get(slug) ?? { slug, vehicleType };
			const publicPath = `/img/trabajos/${folder}/${file}`;
			if (kind === 'antes') pair.before = publicPath;
			else if (kind === 'antes-simulado') pair.simulatedBefore = publicPath;
			else pair.after = publicPath;
			pairs.set(slug, pair);
		}
	}

	return [...pairs.values()];
}

function render(pairs: Pair[]): string {
	const items = pairs.map((pair, index) => {
		const before = pair.before ?? pair.simulatedBefore;
		return [
			'\t{',
			`\t\tid: ${JSON.stringify(pair.slug)},`,
			`\t\ttitle: ${JSON.stringify(toTitle(pair.slug))},`,
			`\t\tvehicleType: ${JSON.stringify(pair.vehicleType)},`,
			`\t\tbefore: ${before ? `${JSON.stringify(before)},` : 'null, // TODO: foto'}`,
			...(!pair.before && pair.simulatedBefore ? ['\t\tisSimulated: true,'] : []),
			`\t\tafter: ${JSON.stringify(pair.after)},`,
			'\t\tisPublished: true,',
			`\t\tsortOrder: ${index + 1}`,
			'\t}'
		].join('\n');
	});

	return [
		'// GENERADO por `pnpm gallery:sync`. No editar a mano.',
		"import type { GalleryItem } from '#lib/types';",
		'',
		items.length ? `export const gallery: GalleryItem[] = [\n${items.join(',\n')}\n];` : 'export const gallery: GalleryItem[] = [];',
		''
	].join('\n');
}

const scanned = await scan();
const orphans = scanned.filter((pair) => !pair.after);
for (const orphan of orphans) {
	console.warn(`Sin publicar: "${orphan.slug}" tiene -antes pero no -despues.`);
}

const pairs = scanned.filter((pair) => pair.after);
pairs.sort((a, b) => a.vehicleType.localeCompare(b.vehicleType) || a.slug.localeCompare(b.slug));

for (const pair of pairs) {
	for (const path of [pair.before ?? pair.simulatedBefore, pair.after]) {
		if (path) await buildVariants(join('static', path));
	}
}

await mkdir(join('src', 'lib', 'data'), { recursive: true });
await writeFile(OUTPUT, render(pairs));

const complete = pairs.filter((pair) => pair.before ?? pair.simulatedBefore).length;
console.log(`Galería: ${pairs.length} ítems (${complete} con antes y después).`);
