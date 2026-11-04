import type Lenis from 'lenis';

export const prefersReducedMotion = () =>
	typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isLightDevice = () =>
	typeof matchMedia === 'function' && !matchMedia('(min-width: 1024px) and (pointer: fine)').matches;

let triggers: typeof import('gsap/ScrollTrigger').ScrollTrigger | null = null;
let loaded: Promise<{
	gsap: typeof import('gsap').gsap;
	ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
}> | null = null;

/** GSAP se carga aparte para que no pese en la primera pintura. */
export function loadGsap() {
	loaded ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
		([{ gsap }, { ScrollTrigger }]) => {
			gsap.registerPlugin(ScrollTrigger);
			triggers = ScrollTrigger;
			return { gsap, ScrollTrigger };
		}
	);
	return loaded;
}

/** Fade + 20 px, escalonado. Cada elemento se revela una sola vez. */
export async function revealPending() {
	const pending = gatherPending();
	if (pending.length === 0) return;

	if (prefersReducedMotion()) {
		markRevealed(pending);
		return;
	}

	try {
		const { gsap, ScrollTrigger } = await loadGsap();
		const fresh = gatherPending();
		ScrollTrigger.batch(fresh, {
			start: 'top 90%',
			once: true,
			onEnter: (batch) => {
				const elements = batch as HTMLElement[];
				gsap.fromTo(
					elements,
					{ opacity: 0, y: 20 },
					{
						opacity: 1,
						y: 0,
						duration: isLightDevice() ? 0.45 : 0.7,
						stagger: isLightDevice() ? 0.05 : 0.09,
						ease: 'power2.out',
						clearProps: 'transform',
						onStart: () => markRevealed(elements)
					}
				);
			}
		});
		refreshKeepingScroll(ScrollTrigger);
		watchPageHeight(() => refreshKeepingScroll(ScrollTrigger));
	} catch {
		markRevealed(gatherPending());
	}
}

/**
 * refresh() lleva el scroll a 0 y vuelve a la posición que tenía guardada, que tras cambiar
 * de página puede ser la anterior. La posición real es la que manda.
 */
function refreshKeepingScroll(ScrollTrigger: NonNullable<typeof triggers>) {
	const y = scrollY;
	ScrollTrigger.refresh();
	if (Math.abs(scrollY - y) > 1) scrollTo({ top: y, behavior: 'instant' });
}

let heightObserver: ResizeObserver | null = null;

/** Las fuentes llegan tarde y cambian la altura de los títulos: recalcula cada disparador. */
function watchPageHeight(refresh: () => void) {
	if (heightObserver) return;
	let timer: ReturnType<typeof setTimeout>;
	let lastHeight = document.body.offsetHeight;
	heightObserver = new ResizeObserver(() => {
		if (document.body.offsetHeight === lastHeight) return;
		lastHeight = document.body.offsetHeight;
		clearTimeout(timer);
		timer = setTimeout(refresh, 120);
	});
	heightObserver.observe(document.body);
}

function gatherPending() {
	return [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')];
}

function markRevealed(elements: HTMLElement[]) {
	for (const element of elements) element.dataset.revealed = '';
}

let lenis: Lenis | null = null;

/** Scroll suave solo en desktop: en mobile manda el scroll nativo. */
export async function initSmoothScroll() {
	if (prefersReducedMotion() || isLightDevice() || lenis) return;

	const [{ default: LenisClass }, { gsap, ScrollTrigger }] = await Promise.all([
		import('lenis'),
		loadGsap()
	]);

	lenis = new LenisClass({ anchors: true, lerp: 0.12 });
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => lenis?.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
}

/** Al cambiar de página, los disparadores de la anterior ya no tienen elementos. */
export function dropStaleTriggers() {
	for (const trigger of triggers?.getAll() ?? []) {
		if (trigger.trigger && !trigger.trigger.isConnected) trigger.kill();
	}
}

/** Al cambiar de página: arriba de todo o a la sección del link, sin animación. */
export function jumpAfterNavigation(hash: string) {
	const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;

	if (lenis) {
		lenis.resize();
		lenis.scrollTo(target ?? 0, { immediate: true, force: true });
	} else if (target) {
		target.scrollIntoView({ behavior: 'instant' });
	} else {
		scrollTo({ top: 0, behavior: 'instant' });
	}
}

export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();
