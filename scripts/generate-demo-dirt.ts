/**
 * pnpm demo:dirt
 *
 * SOLO PARA LA DEMO. Ensucia por software fotos reales de "después" para mostrar
 * cómo funciona el comparador mientras no haya fotos reales de "antes".
 *
 * Genera <nombre>-antes-simulado.webp, con la misma geometría que la original.
 * La web las marca como simulación y solo las muestra en la demo de GitHub Pages y en `pnpm dev`.
 */
import { join } from 'node:path';
import sharp from 'sharp';

type Point = [number, number];
type Wheel = { x: number; y: number; rx: number; ry: number };

interface Target {
	file: string;
	body: Point[];
	glass: Point[][];
	wheels: Wheel[];
	/** Contorno inferior del auto: la suciedad se mide desde acá hacia arriba. */
	ground: Point[];
	carHeight: number;
	seed: number;
}

const TARGETS: Target[] = [
	{
		file: 'autos/scirocco-lateral',
		body: [
			[28, 740], [45, 680], [130, 640], [330, 600], [420, 560], [540, 480], [650, 455], [900, 450],
			[1100, 465], [1260, 505], [1340, 600], [1370, 650], [1398, 720], [1395, 800], [1350, 862],
			[1040, 876], [375, 872], [110, 860], [50, 835], [28, 790]
		],
		glass: [[[485, 592], [600, 500], [870, 483], [1135, 498], [1140, 558], [880, 590], [520, 606]]],
		wheels: [{ x: 241, y: 808, rx: 116, ry: 111 }, { x: 1178, y: 833, rx: 123, ry: 112 }],
		ground: [[0, 872], [1440, 872]],
		carHeight: 420,
		seed: 11
	},
	{
		file: 'autos/scirocco-frente',
		body: [
			[65, 880], [70, 740], [105, 590], [180, 470], [245, 420], [320, 400], [470, 205], [720, 185],
			[1110, 225], [1215, 410], [1260, 440], [1340, 590], [1400, 700], [1408, 860], [1385, 1010],
			[1300, 1075], [1040, 1125], [620, 1130], [340, 1090], [130, 1010], [75, 950]
		],
		glass: [[[315, 402], [450, 210], [720, 190], [1110, 228], [1210, 425], [800, 420], [470, 405]]],
		wheels: [],
		ground: [[0, 1125], [1440, 1125]],
		carHeight: 940,
		seed: 41
	},
	{
		file: 'autos/scirocco-tres-cuartos',
		body: [
			[5, 880], [30, 830], [60, 740], [230, 660], [440, 605], [620, 480], [800, 445], [1100, 440],
			[1270, 480], [1330, 590], [1415, 700], [1425, 760], [1400, 880], [1300, 890], [1090, 1000],
			[1050, 1040], [830, 1180], [720, 1200], [280, 1240], [60, 1130], [5, 1010]
		],
		glass: [
			[[460, 600], [690, 470], [1090, 450], [980, 630], [780, 630], [650, 620]],
			[[1090, 590], [1120, 480], [1240, 490], [1320, 575], [1260, 620]]
		],
		wheels: [{ x: 935, y: 1043, rx: 112, ry: 205 }, { x: 1365, y: 810, rx: 55, ry: 100 }],
		ground: [[5, 1010], [300, 1240], [830, 1190], [1060, 1030], [1400, 880]],
		carHeight: 560,
		seed: 43
	},
	{
		file: 'autos/scirocco-trasera',
		body: [
			[15, 520], [30, 430], [120, 340], [210, 270], [340, 180], [520, 155], [900, 155], [1000, 190],
			[1330, 225], [1440, 340], [1440, 800], [1130, 930], [900, 950], [520, 740], [400, 680],
			[130, 590], [30, 550]
		],
		glass: [
			[[205, 340], [290, 225], [520, 200], [780, 240], [770, 320], [465, 350]],
			[[1000, 280], [1330, 255], [1440, 370], [1320, 420], [1050, 435]]
		],
		wheels: [{ x: 735, y: 815, rx: 165, ry: 210 }, { x: 75, y: 535, rx: 65, ry: 115 }],
		ground: [[130, 600], [880, 950], [1440, 850]],
		carHeight: 520,
		seed: 47
	},
	{
		file: 'autos/mercedes-cla-lateral',
		body: [
			[18, 860], [60, 770], [165, 680], [285, 632], [470, 612], [530, 620], [700, 650], [960, 765],
			[1200, 800], [1330, 850], [1415, 915], [1428, 1130], [1330, 1195], [1060, 1242], [965, 1210],
			[660, 1130], [190, 1010], [60, 975], [20, 900]
		],
		glass: [
			[[165, 738], [225, 690], [290, 645], [470, 635], [545, 680], [630, 782], [470, 755], [320, 742]],
			[[520, 618], [700, 650], [950, 755], [780, 768], [640, 770], [570, 690]]
		],
		wheels: [{ x: 820, y: 1100, rx: 140, ry: 157 }, { x: 112, y: 955, rx: 60, ry: 97 }],
		ground: [[190, 1010], [1060, 1242]],
		carHeight: 420,
		seed: 23
	},
	{
		file: 'autos/mercedes-cla-frente',
		body: [
			[25, 650], [90, 520], [200, 395], [260, 370], [720, 368], [830, 440], [970, 540], [1290, 680],
			[1360, 730], [1425, 900], [1420, 1100], [1330, 1160], [1000, 1225], [760, 1260], [360, 1210],
			[300, 1130], [60, 830], [25, 780]
		],
		glass: [
			[[265, 420], [280, 370], [720, 368], [935, 548], [270, 560]],
			[[105, 510], [200, 400], [220, 540], [150, 500]]
		],
		wheels: [{ x: 250, y: 1005, rx: 62, ry: 205 }, { x: 45, y: 775, rx: 30, ry: 100 }],
		ground: [[50, 880], [320, 1210], [760, 1260], [1420, 1120]],
		carHeight: 640,
		seed: 53
	},
	{
		file: 'autos/mercedes-cla-trasera',
		body: [
			[15, 850], [90, 640], [300, 590], [420, 520], [640, 460], [950, 455], [1130, 490], [1260, 610],
			[1330, 640], [1420, 740], [1430, 850], [1320, 880], [990, 1010], [780, 1120], [500, 1120],
			[300, 1060], [60, 990], [15, 900]
		],
		glass: [
			[[310, 590], [530, 490], [775, 490], [650, 615]],
			[[860, 620], [930, 510], [1050, 490], [1180, 520], [1255, 625], [1100, 615]]
		],
		wheels: [{ x: 855, y: 1000, rx: 115, ry: 170 }, { x: 1370, y: 820, rx: 50, ry: 100 }],
		ground: [[20, 970], [480, 1120], [780, 1120], [1000, 1005], [1320, 880]],
		carHeight: 580,
		seed: 59
	},
	{
		file: 'camionetas/amarok-lateral',
		body: [
			[115, 802], [130, 700], [285, 670], [345, 530], [620, 505], [800, 520], [1030, 655], [1250, 692],
			[1430, 745], [1440, 1020], [1130, 1088], [1020, 1075], [655, 1000], [320, 930], [150, 850], [115, 830]
		],
		glass: [
			[[330, 542], [625, 530], [652, 640], [325, 662]],
			[[622, 515], [800, 522], [1028, 655], [652, 640]]
		],
		wheels: [{ x: 860, y: 1043, rx: 157, ry: 180 }, { x: 231, y: 920, rx: 72, ry: 100 }],
		ground: [[150, 850], [1090, 1085]],
		carHeight: 450,
		seed: 37
	},
	{
		file: 'camionetas/amarok-frente',
		body: [
			[160, 800], [190, 700], [260, 620], [300, 580], [390, 510], [470, 365], [900, 365], [1010, 510],
			[1080, 560], [1200, 640], [1240, 730], [1265, 880], [1240, 1020], [1150, 1060], [1100, 1110],
			[400, 1110], [240, 1075], [180, 1030], [160, 950]
		],
		glass: [[[395, 505], [470, 368], [900, 368], [1010, 515], [700, 505]]],
		wheels: [{ x: 305, y: 1120, rx: 95, ry: 55 }, { x: 1185, y: 1085, rx: 90, ry: 50 }],
		ground: [[0, 1110], [1440, 1110]],
		carHeight: 740,
		seed: 61
	},
	{
		file: 'camionetas/amarok-trasera',
		body: [
			[20, 850], [45, 585], [470, 570], [510, 460], [850, 445], [920, 470], [1010, 530], [1100, 650],
			[1170, 700], [1170, 800], [1110, 860], [960, 900], [930, 930], [740, 980], [670, 1020],
			[420, 1010], [280, 985], [90, 920], [20, 880]
		],
		glass: [
			[[480, 575], [510, 465], [880, 470], [900, 605], [700, 590]],
			[[935, 490], [1005, 515], [1095, 655], [1025, 640], [965, 630]]
		],
		wheels: [{ x: 835, y: 990, rx: 100, ry: 150 }, { x: 1115, y: 845, rx: 68, ry: 80 }],
		ground: [[20, 880], [420, 1010], [740, 990], [960, 900], [1170, 800]],
		carHeight: 480,
		seed: 67
	}
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
	const t = clamp01((v - a) / (b - a));
	return t * t * (3 - 2 * t);
};

function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Ruido suave en [0, 1]: una grilla aleatoria chica, agrandada. */
async function noise(size: number, cellW: number, cellH: number, random: () => number) {
	const w = Math.ceil(size / cellW);
	const h = Math.ceil(size / cellH);
	const raw = Buffer.alloc(w * h);
	for (let i = 0; i < raw.length; i++) raw[i] = random() * 255;
	const data = await sharp(raw, { raw: { width: w, height: h, channels: 1 } })
		.resize(size, size, { kernel: 'cubic' })
		.extractChannel(0)
		.raw()
		.toBuffer();
	return (x: number, y: number) => data[y * size + x] / 255;
}

/** Máscara en [0, 1] a partir de un SVG. */
async function maskFromSvg(size: number, content: string, blur: number) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="#000"/>${content}</svg>`;
	const data = await sharp(Buffer.from(svg)).blur(blur).extractChannel(0).raw().toBuffer();
	return (x: number, y: number) => data[y * size + x] / 255;
}

const polygon = (points: Point[]) =>
	`<polygon fill="#fff" points="${points.map((p) => p.join(',')).join(' ')}"/>`;

/** Gotitas finas: pocas arriba, más sobre los zócalos y alrededor de las ruedas. */
function splatterSvg(target: Target, groundAt: (x: number) => number, random: () => number) {
	const shapes: string[] = [];
	const xs = target.body.map((p) => p[0]);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);

	const drop = (x: number, y: number, r: number) => {
		const shade = (90 + random() * 165) | 0;
		const stretch = 1 + random() * 0.7;
		shapes.push(
			`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(2)}" ry="${(r * stretch).toFixed(2)}" fill="rgb(${shade},${shade},${shade})"/>`
		);
	};

	for (let i = 0; i < 9000; i++) {
		const x = minX + random() * (maxX - minX);
		const y = groundAt(x) - random() ** 2.6 * target.carHeight;
		drop(x, y, 0.5 + random() ** 5 * 1.9);
	}

	for (const wheel of target.wheels) {
		for (let i = 0; i < 2600; i++) {
			const angle = random() * Math.PI * 2;
			const distance = 0.95 + random() ** 1.8 * 0.75;
			drop(
				wheel.x + Math.cos(angle) * wheel.rx * distance,
				wheel.y + Math.sin(angle) * wheel.ry * distance,
				0.5 + random() ** 4 * 2.3
			);
		}
	}
	return shapes.join('');
}

async function generate(target: Target) {
	const input = join('static', 'img', 'trabajos', `${target.file}-despues.webp`);
	const output = join('static', 'img', 'trabajos', `${target.file}-antes-simulado.webp`);
	const random = rng(target.seed);

	const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const size = info.width;
	if (info.height !== size) throw new Error(`Se esperaba una foto cuadrada: ${input}`);

	const groundAt = (x: number) => {
		const line = target.ground;
		let i = 0;
		while (i < line.length - 2 && x > line[i + 1][0]) i++;
		const [[x0, y0], [x1, y1]] = [line[i], line[i + 1]];
		return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
	};

	const bodyMask = await maskFromSvg(size, polygon(target.body), 4);
	const glassMask = await maskFromSvg(size, target.glass.map(polygon).join(''), 3);
	const wheelMask = await maskFromSvg(
		size,
		target.wheels
			.map((w) => `<ellipse cx="${w.x}" cy="${w.y}" rx="${w.rx}" ry="${w.ry}" fill="#fff"/>`)
			.join(''),
		3
	);
	const splatter = await maskFromSvg(size, splatterSvg(target, groundAt, random), 0.5);

	const patchesLarge = await noise(size, 120, 80, random);
	const patchesSmall = await noise(size, 26, 18, random);
	const grain = await noise(size, 2, 2, random);
	const streaks = await noise(size, 9, 170, random);

	const out = Buffer.from(data);
	const blend = (i: number, r: number, g: number, b: number, a: number) => {
		out[i] = out[i] + (r - out[i]) * a;
		out[i + 1] = out[i + 1] + (g - out[i + 1]) * a;
		out[i + 2] = out[i + 2] + (b - out[i + 2]) * a;
	};

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const wheel = wheelMask(x, y);
			const body = bodyMask(x, y) * (1 - wheel);
			if (body + wheel < 0.004) continue;

			const i = (y * size + x) * 3;
			const glass = glassMask(x, y);
			const paint = body * (1 - glass);
			// 0 en el techo, 1 en el zócalo.
			const height = clamp01(1 - (groundAt(x) - y) / target.carHeight);
			const low = smooth(0.5, 1, height);

			const cloud = 0.45 * patchesLarge(x, y) + 0.3 * patchesSmall(x, y) + 0.45;
			const fine = 0.92 + grain(x, y) * 0.16;
			// El agua abre surcos verticales en el polvo.
			const runs = smooth(0.58, 0.72, streaks(x, y)) * smooth(0.25, 0.7, height);

			// 1. Pintura sin brillo: los reflejos se apagan.
			const luma = 0.3 * out[i] + 0.59 * out[i + 1] + 0.11 * out[i + 2];
			blend(i, luma, luma, luma, paint * 0.3);

			// 2. Película de polvo, más densa abajo.
			const dust = (0.13 + height * 0.16 + low * 0.2) * cloud * (1 - runs * 0.5);
			blend(i, 141 * fine, 127 * fine, 106 * fine, clamp01(dust) * paint);

			// 3. Tierra acumulada en los zócalos.
			const mud = low * low * smooth(0.42, 0.68, patchesSmall(x, y)) * 0.22;
			blend(i, 108 * fine, 90 * fine, 68 * fine, mud * paint);

			// 4. Vidrios: una película leve.
			blend(i, 150, 140, 122, body * glass * (0.05 + cloud * 0.07));

			// 5. Ruedas: polvo de freno y tierra.
			blend(i, 112 * fine, 96 * fine, 76 * fine, wheel * (0.2 + patchesSmall(x, y) * 0.26));

			// 6. Gotitas secas.
			const speck = splatter(x, y);
			if (speck > 0.03) {
				blend(i, 124, 111, 93, speck * 0.55 * (paint + wheel * 0.7 + body * glass * 0.3));
			}
		}
	}

	await sharp(out, { raw: { width: size, height: size, channels: 3 } })
		.webp({ quality: 88 })
		.toFile(output);
	console.log(`Simulada: ${output}`);
}

for (const target of TARGETS) await generate(target);
