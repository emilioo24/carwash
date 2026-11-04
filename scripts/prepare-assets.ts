/**
 * pnpm assets:prepare
 *
 * Tarea de una sola vez: toma las fotos de fotos-originales/ (que no se tocan),
 * difumina patentes, les pone nombres con la convención de la galería y genera
 * logo, favicon, imagen Open Graph y la foto de proceso.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { buildVariants } from './lib/images.ts';

const SOURCE = 'fotos-originales';
const IMG = join('static', 'img');

type Box = { left: number; top: number; width: number; height: number };

const PHOTOS: { file: string; target: string; blur?: Box[] }[] = [
	{ file: '483577577_17902297371109215_8799787646303713026_n.webp', target: 'autos/scirocco-tres-cuartos-despues.webp' },
	{ file: '483223835_17902297413109215_7264560093260602686_n.webp', target: 'autos/scirocco-frente-despues.webp' },
	{
		file: '482989402_17902297395109215_5254345722891289825_n.webp',
		target: 'autos/scirocco-lateral-despues.webp',
		blur: [{ left: 1400, top: 690, width: 40, height: 90 }]
	},
	{
		file: '482826906_17902297386109215_2316540080608765897_n.webp',
		target: 'autos/scirocco-trasera-despues.webp',
		blur: [{ left: 1350, top: 635, width: 90, height: 140 }]
	},
	{ file: '484766752_17903236278109215_4276367066332732371_n.webp', target: 'autos/mercedes-cla-frente-despues.webp' },
	{ file: '485217233_17903236263109215_3470954005941678348_n.webp', target: 'autos/mercedes-cla-lateral-despues.webp' },
	{ file: '484793047_17903236281109215_586275032452492330_n.webp', target: 'autos/mercedes-cla-trasera-despues.webp' },
	{
		file: '484326716_17903236299109215_7765351312785346454_n.webp',
		target: 'autos/mercedes-cla-interior-despues.webp',
		blur: [{ left: 1290, top: 1215, width: 130, height: 225 }]
	},
	{ file: '484648015_17903236290109215_2819342360502269841_n.webp', target: 'autos/mercedes-cla-volante-despues.webp' },
	{
		file: '656281074_18092981975107569_5741723488601243155_n.webp',
		target: 'camionetas/amarok-frente-despues.webp',
		blur: [{ left: 105, top: 608, width: 70, height: 45 }]
	},
	{
		file: '657561772_18070083863254255_126760998388395660_n.webp',
		target: 'camionetas/amarok-lateral-despues.webp',
		blur: [{ left: 1375, top: 850, width: 65, height: 90 }]
	},
	{ file: '649681943_17893959984286496_708990334662413195_n.webp', target: 'camionetas/amarok-trasera-despues.webp' }
];

const LOGO_SOURCE = join(SOURCE, '582760322_17931333822109215_4624828923799991311_n.jpg');
const FOAM_SOURCE = join(SOURCE, '758427135_17972590986109215_2820148063011207098_n.jpg');
const HERO = join(IMG, 'trabajos', 'autos', 'scirocco-tres-cuartos-despues.webp');

async function preparePhoto({ file, target, blur }: (typeof PHOTOS)[number]) {
	const input = join(SOURCE, file);
	const output = join(IMG, 'trabajos', target);
	await mkdir(dirname(output), { recursive: true });

	if (!blur?.length) {
		await copyFile(input, output);
		return;
	}

	const patches = await Promise.all(
		blur.map(async (box) => ({
			input: await sharp(input).extract(box).blur(14).toBuffer(),
			left: box.left,
			top: box.top
		}))
	);
	await sharp(input).composite(patches).webp({ quality: 88 }).toFile(output);
}

/** Saca el fondo oscuro del recorte para que el logo apoye sobre la foto del hero. */
async function prepareNavLogo() {
	const crop = { left: 80, top: 85, width: 880, height: 460 };
	const { data, info } = await sharp(LOGO_SOURCE)
		.extract(crop)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const LOW = 44;
	const HIGH = 84;
	for (let i = 0; i < data.length; i += 4) {
		const brightest = Math.max(data[i], data[i + 1], data[i + 2]);
		const t = Math.min(1, Math.max(0, (brightest - LOW) / (HIGH - LOW)));
		data[i + 3] = Math.round(t * t * (3 - 2 * t) * 255);
	}

	const image = sharp(data, { raw: info });
	await image.clone().resize({ width: 320 }).webp({ quality: 88, alphaQuality: 90 }).toFile(join(IMG, 'logo-nav.webp'));
}

/** La salpicadura real del logo, sin fondo ni letras. */
async function prepareSplash() {
	const { data, info } = await sharp(LOGO_SOURCE)
		.extract({ left: 205, top: 80, width: 590, height: 215 })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	for (let i = 0; i < data.length; i += 4) {
		const t = Math.min(1, Math.max(0, (data[i + 2] - data[i] - 22) / 40));
		data[i + 3] = Math.round(t * t * (3 - 2 * t) * 255);
	}

	await sharp(data, { raw: info }).webp({ quality: 80, alphaQuality: 80 }).toFile(join(IMG, 'splash.webp'));
}

async function prepareLogo() {
	await sharp(LOGO_SOURCE).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(join(IMG, 'logo.png'));
	await sharp(LOGO_SOURCE).resize(560).webp({ quality: 82 }).toFile(join(IMG, 'logo-560.webp'));
	await prepareNavLogo();
	await prepareSplash();

	await sharp(LOGO_SOURCE).resize(48).png().toFile(join('static', 'favicon.png'));
	await sharp(LOGO_SOURCE).resize(180).png().toFile(join('static', 'apple-touch-icon.png'));
}

async function prepareOpenGraph() {
	const shade = Buffer.from(
		`<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1">
			<stop offset="0" stop-color="#111518" stop-opacity=".94"/>
			<stop offset=".62" stop-color="#111518" stop-opacity=".25"/>
			<stop offset="1" stop-color="#111518" stop-opacity=".1"/>
		</linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`
	);
	const logo = await sharp(LOGO_SOURCE).resize(470).png().toBuffer();
	await sharp(HERO)
		.resize(1200, 630, { fit: 'cover', position: 'centre' })
		.composite([
			{ input: shade, left: 0, top: 0 },
			{ input: logo, left: 40, top: 80, blend: 'lighten' }
		])
		.jpeg({ quality: 82, mozjpeg: true })
		.toFile(join(IMG, 'og.jpg'));
}

await mkdir(join(IMG, 'proceso'), { recursive: true });
await Promise.all(PHOTOS.map(preparePhoto));
await prepareLogo();
await prepareOpenGraph();

const foam = join(IMG, 'proceso', 'espuma.webp');
await sharp(FOAM_SOURCE).webp({ quality: 88 }).toFile(foam);
await buildVariants(foam);

console.log(`Listo: ${PHOTOS.length} fotos, logo, favicon, Open Graph y proceso.`);
