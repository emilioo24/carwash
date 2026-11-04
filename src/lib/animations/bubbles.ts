interface Bubble {
	x: number;
	y: number;
	radius: number;
	speed: number;
	drift: number;
	phase: number;
	alpha: number;
}

/** Burbuja dibujada una sola vez: cada frame solo copia el sprite. */
function createSprite(): HTMLCanvasElement {
	const size = 64;
	const sprite = document.createElement('canvas');
	sprite.width = sprite.height = size;
	const ctx = sprite.getContext('2d')!;
	const center = size / 2;

	const body = ctx.createRadialGradient(center, center, center * 0.55, center, center, center * 0.96);
	body.addColorStop(0, 'rgba(120, 200, 230, 0)');
	body.addColorStop(0.82, 'rgba(120, 200, 230, 0.14)');
	body.addColorStop(1, 'rgba(210, 240, 250, 0.62)');
	ctx.fillStyle = body;
	ctx.beginPath();
	ctx.arc(center, center, center * 0.96, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
	ctx.beginPath();
	ctx.ellipse(center * 0.66, center * 0.62, size * 0.09, size * 0.055, -0.7, 0, Math.PI * 2);
	ctx.fill();

	return sprite;
}

/**
 * Burbujas livianas: se pausan fuera de pantalla o con la pestaña oculta.
 * Devuelve la función que las detiene.
 */
export function startBubbles(canvas: HTMLCanvasElement, count: number): () => void {
	const ctx = canvas.getContext('2d');
	if (!ctx) return () => {};

	const sprite = createSprite();
	let width = 0;
	let height = 0;
	let frame = 0;
	let previous = 0;
	let visible = true;

	const spawn = (anywhere: boolean): Bubble => ({
		x: Math.random() * width,
		y: anywhere ? Math.random() * height : height + 40,
		radius: 3 + Math.random() ** 2 * 22,
		speed: 14 + Math.random() * 34,
		drift: 6 + Math.random() * 14,
		phase: Math.random() * Math.PI * 2,
		alpha: 0.22 + Math.random() * 0.5
	});

	const resize = () => {
		const ratio = Math.min(devicePixelRatio || 1, 1.5);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = Math.round(width * ratio);
		canvas.height = Math.round(height * ratio);
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
	};

	resize();
	const bubbles = Array.from({ length: count }, () => spawn(true));

	const draw = (time: number) => {
		frame = 0;
		if (!visible || document.hidden) {
			previous = 0;
			return;
		}

		const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
		previous = time;
		ctx.clearRect(0, 0, width, height);

		for (let i = 0; i < bubbles.length; i++) {
			const bubble = bubbles[i];
			bubble.y -= bubble.speed * delta;
			bubble.phase += delta;
			if (bubble.y < -40) {
				bubbles[i] = spawn(false);
				continue;
			}
			const x = bubble.x + Math.sin(bubble.phase) * bubble.drift;
			const diameter = bubble.radius * 2;
			ctx.globalAlpha = bubble.alpha;
			ctx.drawImage(sprite, x - bubble.radius, bubble.y - bubble.radius, diameter, diameter);
		}

		frame = requestAnimationFrame(draw);
	};

	const start = () => {
		if (!frame) frame = requestAnimationFrame(draw);
	};

	const observer = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible) start();
	});
	observer.observe(canvas);

	const onVisibility = () => {
		if (!document.hidden) start();
	};
	document.addEventListener('visibilitychange', onVisibility);
	addEventListener('resize', resize, { passive: true });

	start();

	return () => {
		cancelAnimationFrame(frame);
		observer.disconnect();
		document.removeEventListener('visibilitychange', onVisibility);
		removeEventListener('resize', resize);
	};
}
