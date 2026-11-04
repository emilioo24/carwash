<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, prefersReducedMotion } from '#lib/animations/motion';
	import Picture from '#lib/components/ui/Picture.svelte';
	import PhotoPlaceholder from '#lib/components/ui/PhotoPlaceholder.svelte';

	interface Props {
		title: string;
		before: string | null;
		after: string | null;
		simulated?: boolean;
		sizes?: string;
		sweep?: boolean;
		class?: string;
	}

	let { title, before, after, simulated = false, sizes = '100vw', sweep = false, class: className = '' }: Props = $props();

	let position = $state(50);
	let dragging = $state(false);
	let frame = $state<HTMLElement>();
	let cancelSweep = () => {};

	const clamp = (value: number) => Math.min(100, Math.max(0, value));

	function moveTo(clientX: number) {
		if (!frame) return;
		const rect = frame.getBoundingClientRect();
		position = clamp(((clientX - rect.left) / rect.width) * 100);
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		cancelSweep();
		dragging = true;
		frame?.setPointerCapture(event.pointerId);
		moveTo(event.clientX);
	}

	function onPointerMove(event: PointerEvent) {
		if (dragging) moveTo(event.clientX);
	}

	function onPointerUp() {
		dragging = false;
	}

	function onKeydown(event: KeyboardEvent) {
		const steps: Record<string, number> = {
			ArrowLeft: position - 2,
			ArrowDown: position - 2,
			ArrowRight: position + 2,
			ArrowUp: position + 2,
			PageDown: position - 10,
			PageUp: position + 10,
			Home: 0,
			End: 100
		};
		if (!(event.key in steps)) return;
		event.preventDefault();
		cancelSweep();
		position = clamp(steps[event.key]);
	}

	onMount(() => {
		if (!sweep || prefersReducedMotion() || !frame) return;

		let tween: { kill: () => void } | null = null;
		let cancelled = false;
		cancelSweep = () => {
			cancelled = true;
			tween?.kill();
		};

		// El barrido corre una sola vez, la primera vez que aparece en pantalla.
		const observer = new IntersectionObserver(
			async ([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				const { gsap } = await loadGsap();
				if (cancelled) return;
				const proxy = { value: position };
				tween = gsap
					.timeline({ onUpdate: () => (position = proxy.value) })
					.to(proxy, { value: 12, duration: 0.5, ease: 'power2.inOut' })
					.to(proxy, { value: 88, duration: 1.3, ease: 'power2.inOut' })
					.to(proxy, { value: 50, duration: 0.7, ease: 'power2.inOut' });
			},
			{ threshold: 0.55 }
		);
		observer.observe(frame);

		return () => {
			observer.disconnect();
			cancelSweep();
		};
	});
</script>

<div
	bind:this={frame}
	class="compare {className}"
	class:dragging
	style:--pos="{position}%"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerUp}
	role="presentation"
>
	<div class="layer">
		{#if after}
			<Picture src={after} alt="{title}, después del lavado" {sizes} class="compare-img" />
		{:else}
			<PhotoPlaceholder />
		{/if}
	</div>

	<div class="layer before">
		{#if before}
			<Picture src={before} alt={simulated ? `${title}, simulación de cómo se vería sucio` : `${title}, antes del lavado`} {sizes} class="compare-img" />
		{:else}
			<PhotoPlaceholder label="TODO: foto de antes" side />
		{/if}
	</div>

	<span class="tag tag-before" aria-hidden="true">{simulated ? 'Antes (simulación)' : 'Antes'}</span>
	<span class="tag tag-after" aria-hidden="true">Después</span>

	<div class="line" aria-hidden="true">
		<i></i><i></i><i></i>
	</div>

	<div
		class="handle"
		role="slider"
		tabindex="0"
		aria-label="Comparar antes y después: {title}"
		aria-orientation="horizontal"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(position)}
		aria-valuetext="{Math.round(position)}% de la foto de antes visible"
		onkeydown={onKeydown}
	>
		<svg viewBox="0 0 40 40" aria-hidden="true">
			<path d="M16 12 8 20l8 8M24 12l8 8-8 8" />
		</svg>
	</div>
</div>

<style>
	.compare {
		position: relative;
		overflow: hidden;
		user-select: none;
		touch-action: pan-y;
		cursor: ew-resize;
		background: var(--color-panel);
	}

	.layer {
		position: absolute;
		inset: 0;
	}

	.layer.before {
		clip-path: inset(0 calc(100% - var(--pos)) 0 0);
	}

	.compare :global(.compare-img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.tag {
		position: absolute;
		top: clamp(12px, 2vw, 24px);
		border-radius: 10px;
		padding: 1px 12px;
		font-family: var(--font-comic);
		font-size: clamp(1.125rem, 2.4vw, 1.75rem);
		letter-spacing: 0.04em;
		pointer-events: none;
	}

	.tag-before {
		left: clamp(12px, 2vw, 24px);
		background: var(--color-ink);
		transform: rotate(-2deg);
	}

	.tag-after {
		right: clamp(12px, 2vw, 24px);
		background: var(--color-orange);
		color: var(--color-ink);
		transform: rotate(2deg);
	}

	.line {
		position: absolute;
		inset-block: 0;
		left: var(--pos);
		width: 3px;
		background: var(--color-paper);
		box-shadow: 0 0 18px rgb(43 143 179 / 0.9);
		transform: translateX(-50%);
		pointer-events: none;
	}

	/* Al arrastrar, la línea gotea como un secador sobre la pintura. */
	.line i {
		position: absolute;
		left: 50%;
		width: 7px;
		height: 11px;
		margin-left: -3.5px;
		border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
		background: #8fd3ea;
		opacity: 0;
	}

	.dragging .line i {
		animation: drip 0.8s linear infinite;
	}

	.line i:nth-child(1) {
		top: 18%;
	}

	.line i:nth-child(2) {
		top: 46%;
		animation-delay: 0.26s !important;
	}

	.line i:nth-child(3) {
		top: 68%;
		animation-delay: 0.52s !important;
	}

	@keyframes drip {
		0% {
			opacity: 0;
			transform: translateY(0);
		}
		20% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(70px);
		}
	}

	.handle {
		position: absolute;
		top: 50%;
		left: var(--pos);
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border: 3px solid var(--color-paper);
		border-radius: 50%;
		background: var(--color-water);
		box-shadow: 0 6px 22px rgb(0 0 0 / 0.5);
		transform: translate(-50%, -50%);
		transition: scale 0.25s var(--bounce);
		cursor: grab;
	}

	.dragging .handle {
		scale: 1.12;
		cursor: grabbing;
	}

	.handle:focus-visible {
		outline-offset: 4px;
		border-radius: 50%;
	}

	.handle svg {
		width: 30px;
		fill: none;
		stroke: #fff;
		stroke-width: 3.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
