<script lang="ts">
	interface Props {
		label?: string;
		side?: boolean; // deja el texto en la mitad izquierda, lejos de la línea del slider
	}

	let { label = 'TODO: foto', side = false }: Props = $props();
</script>

<div class="placeholder" class:side>
	<svg viewBox="0 0 24 32" aria-hidden="true">
		<path d="M12 1C7 10 2 15 2 21a10 10 0 0 0 20 0C22 15 17 10 12 1Z" />
	</svg>
	<span>{label}</span>
</div>

<style>
	.placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background:
			radial-gradient(circle at 30% 20%, rgb(43 143 179 / 0.55), transparent 58%),
			radial-gradient(circle at 75% 85%, rgb(242 145 27 / 0.2), transparent 52%),
			linear-gradient(145deg, #243039, var(--color-panel));
		color: var(--color-paper);
	}

	.side {
		padding-right: 50%;
	}

	svg {
		width: clamp(22px, 4vw, 40px);
		fill: rgb(244 246 248 / 0.55);
	}

	span {
		font-size: 0.875rem;
		font-weight: 600;
	}
</style>
