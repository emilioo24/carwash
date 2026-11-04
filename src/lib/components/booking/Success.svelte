<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import SocialIcon from '#lib/components/ui/SocialIcon.svelte';

	interface Props {
		summary: string;
		whatsappUrl: string;
		onreset: () => void;
	}

	let { summary, whatsappUrl, onreset }: Props = $props();
</script>

<div class="success" role="status" in:scale={{ start: 0.85, duration: 380, easing: backOut }}>
	<div class="mark" aria-hidden="true">
		<i></i><i></i><i></i><i></i>
		<svg viewBox="0 0 64 64">
			<circle cx="32" cy="32" r="29" pathLength="1" />
			<path d="M19 33.5 28 42.5 46 22" pathLength="1" />
		</svg>
	</div>
	<h3>Tu pedido de turno está listo</h3>
	<p class="summary">{summary}</p>
	<p class="note">Te confirmamos el turno por <SocialIcon name="whatsapp" labelled /></p>
	<a class="btn btn-primary" href={whatsappUrl} target="_blank" rel="noopener" aria-label="Enviar pedido por WhatsApp">
		<SocialIcon name="whatsapp" />
		Enviar pedido
	</a>
	<a class="again" href="?" onclick={(event) => { event.preventDefault(); onreset(); }}>Reservar otro turno</a>
</div>

<style>
	.success {
		display: grid;
		justify-items: center;
		gap: 12px;
		border: 2px solid var(--color-water);
		border-radius: 24px;
		background: var(--color-ink);
		padding: clamp(32px, 6vw, 64px) clamp(20px, 4vw, 48px);
		text-align: center;
	}

	.mark {
		position: relative;
		width: 96px;
		height: 96px;
		margin-bottom: 8px;
	}

	.mark svg {
		width: 100%;
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	circle {
		stroke: var(--color-water);
		stroke-width: 4;
		stroke-dasharray: 1;
		animation: draw 0.6s ease-out both;
	}

	path {
		stroke: var(--color-orange);
		stroke-width: 6;
		stroke-dasharray: 1;
		animation: draw 0.35s 0.45s ease-out both;
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	i {
		position: absolute;
		top: 12px;
		left: 50%;
		width: 10px;
		height: 14px;
		border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
		background: var(--color-water);
		opacity: 0;
		animation: drop 1s 0.55s ease-out both;
	}

	i:nth-child(1) {
		--x: -66px;
		--y: -18px;
	}

	i:nth-child(2) {
		--x: -40px;
		--y: 70px;
		animation-delay: 0.65s;
	}

	i:nth-child(3) {
		--x: 56px;
		--y: -26px;
		animation-delay: 0.6s;
	}

	i:nth-child(4) {
		--x: 42px;
		--y: 76px;
		animation-delay: 0.7s;
	}

	@keyframes drop {
		0% {
			opacity: 0;
			transform: translate(0, 24px) scale(0.4);
		}
		30% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(var(--x), var(--y)) scale(1);
		}
	}

	h3 {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 400;
		line-height: 1.1;
		text-transform: uppercase;
	}

	.summary {
		font-weight: 600;
	}

	.note {
		margin-bottom: 12px;
		color: var(--color-mist);
	}

	.again {
		padding: 8px;
		color: var(--color-mist);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
