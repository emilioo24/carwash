<script lang="ts">
	import { onMount } from 'svelte';
	import { isLightDevice, prefersReducedMotion } from '#lib/animations/motion';
	import Picture from '#lib/components/ui/Picture.svelte';
	import { pictureSources } from '#lib/utils/images';
	import { withBase } from '#lib/utils/paths';

	interface Props {
		image: string;
		chips: string[];
	}

	let { image, chips }: Props = $props();

	const sources = $derived(pictureSources(image));
	// En mobile la foto va oscurecida y es la que define el LCP: se prioriza el peso sobre el detalle.
	const HERO_SIZES = '(min-width: 1024px) max(100vw, 100vh), 400px';

	let canvas = $state<HTMLCanvasElement>();

	onMount(() => {
		if (prefersReducedMotion() || !canvas) return;

		let stop = () => {};
		let cancelled = false;
		const begin = async () => {
			const { startBubbles } = await import('#lib/animations/bubbles');
			if (!cancelled && canvas) stop = startBubbles(canvas, isLightDevice() ? 12 : 34);
		};

		// Espera a que la página esté quieta para no competir con la primera pintura.
		const idle = window.requestIdleCallback ?? ((callback: () => void) => setTimeout(callback, 900));
		idle(() => void begin());

		return () => {
			cancelled = true;
			stop();
		};
	});
</script>

<svelte:head>
	{#if sources.avif}
		<link
			rel="preload"
			as="image"
			type="image/avif"
			imagesrcset={sources.avif}
			imagesizes={HERO_SIZES}
			fetchpriority="high"
		/>
	{/if}
</svelte:head>

<section class="hero">
	<div class="media">
		<Picture
			src={image}
			alt="Volkswagen Scirocco negro recién lavado, con los árboles de la calle reflejados en la pintura"
			sizes={HERO_SIZES}
			class="photo"
			priority
		/>
		<div class="shade"></div>
		<div class="sheen"></div>
		<canvas bind:this={canvas} aria-hidden="true"></canvas>
	</div>

	<div class="shell content">
		<h1>
			<span class="line">Tu auto,</span>
			<span class="word" data-text="reluciente.">reluciente.</span>
		</h1>
		<p class="lead-hero">Lavado premium de autos y camionetas en Zona Norte, Rosario.</p>
		<div class="actions">
			<a class="btn btn-primary" href={withBase('/reservar')}>Reservá tu turno</a>
			<a class="btn btn-outline" href="#antes-y-despues">Ver resultados</a>
		</div>
		<ul class="chips">
			{#each chips as chip}
				<li>{chip}</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.hero {
		position: relative;
		display: flex;
		align-items: flex-end;
		min-height: 100svh;
		overflow: hidden;
		isolation: isolate;
		padding-block: calc(var(--nav-height) + 24px) clamp(28px, 5vh, 56px);
	}

	.media {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.media :global(.photo) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 72%;
		object-fit: cover;
		object-position: 26% 50%;
	}

	.shade {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to top, var(--color-ink) 2%, rgb(17 21 24 / 0.82) 34%, rgb(17 21 24 / 0.2) 72%, rgb(17 21 24 / 0.68)),
			linear-gradient(to right, rgb(17 21 24 / 0.55), transparent 62%);
	}

	.sheen {
		position: absolute;
		inset: -10% -30%;
		background: linear-gradient(
			105deg,
			transparent 42%,
			rgb(255 255 255 / 0.02) 46%,
			rgb(255 255 255 / 0.28) 50%,
			rgb(255 255 255 / 0.02) 54%,
			transparent 58%
		);
		transform: translateX(-70%);
		animation: sweep 8s cubic-bezier(0.45, 0, 0.3, 1) 0.8s infinite;
		will-change: transform;
		pointer-events: none;
	}

	@keyframes sweep {
		0% {
			transform: translateX(-70%);
		}
		28%,
		100% {
			transform: translateX(70%);
		}
	}

	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	h1 {
		display: grid;
		justify-items: start;
		margin-bottom: clamp(14px, 2.5vh, 24px);
	}

	.line {
		font-family: var(--font-display);
		font-size: clamp(3.5rem, 14vw, 10.5rem);
		font-weight: 400;
		line-height: 0.98;
		text-transform: uppercase;
	}

	.word {
		position: relative;
		margin-top: 0.05em;
		font-family: var(--font-comic);
		font-size: clamp(4.1rem, 17.6vw, 13.5rem);
		font-weight: 400;
		line-height: 0.95;
		letter-spacing: 0.01em;
		color: var(--color-orange);
		-webkit-text-stroke: 0.045em var(--color-ink);
		paint-order: stroke fill;
		transform: rotate(-2deg);
		transform-origin: left bottom;
	}

	.word::after {
		content: attr(data-text) / '';
		position: absolute;
		inset: 0;
		color: #fff;
		-webkit-text-stroke: 0;
		mask-image: linear-gradient(105deg, transparent 42%, #000 50%, transparent 58%);
		mask-size: 300% 100%;
		mask-repeat: no-repeat;
		mask-position: 120% 0;
		animation: glint 8s ease-in-out 1.2s infinite;
		pointer-events: none;
	}

	@keyframes glint {
		0% {
			mask-position: 120% 0;
		}
		22%,
		100% {
			mask-position: -20% 0;
		}
	}

	.lead-hero {
		max-width: 34ch;
		margin-bottom: clamp(18px, 3vh, 28px);
		font-size: clamp(1.0625rem, 2vw, 1.375rem);
		font-weight: 500;
		line-height: 1.4;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: clamp(20px, 3.5vh, 36px);
	}

	.actions .btn {
		flex: 1 1 150px;
		padding-inline: 10px;
		white-space: nowrap;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chips li {
		border: 1px solid rgb(244 246 248 / 0.28);
		border-radius: 999px;
		background: rgb(17 21 24 / 0.55);
		padding: 5px 13px;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	@media (min-width: 640px) {
		.actions .btn {
			flex: none;
			min-width: 190px;
		}

		.chips li {
			font-size: 0.875rem;
		}
	}

	@media (min-width: 1024px) {
		.media :global(.photo) {
			height: 100%;
			object-position: 50% 62%;
		}

		.shade {
			background:
				linear-gradient(to top, var(--color-ink) 1%, rgb(17 21 24 / 0.2) 42%, rgb(17 21 24 / 0.55)),
				linear-gradient(to right, rgb(17 21 24 / 0.86), rgb(17 21 24 / 0.2) 72%);
		}
	}
</style>
