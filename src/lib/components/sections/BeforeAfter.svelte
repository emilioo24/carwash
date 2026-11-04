<script lang="ts">
	import CompareSlider from '#lib/components/gallery/CompareSlider.svelte';
	import GalleryGrid from '#lib/components/gallery/GalleryGrid.svelte';
	import type { GalleryItem, VehicleType } from '#lib/types';

	interface Props {
		items: GalleryItem[];
		vehicleTypes: VehicleType[];
		featuredId: string;
	}

	let { items, vehicleTypes, featuredId }: Props = $props();

	// Prioriza un par completo, empezando por el destacado de la configuración.
	const featured = $derived(
		items.find((item) => item.id === featuredId && item.before) ??
			items.find((item) => item.before) ??
			items.find((item) => item.id === featuredId) ??
			items[0]
	);
</script>

<section id="antes-y-despues" class="zone">
	<div class="shell">
		<h2 data-reveal>Antes / después</h2>
		<p class="lead" data-reveal>Arrastrá la línea para comparar. Tocá cualquier trabajo para verlo en grande.</p>
	</div>

	<div class="stage shell" data-reveal>
		<CompareSlider
			class="featured"
			title={featured?.title ?? 'Trabajo de Cars Wash'}
			before={featured?.before ?? null}
			after={featured?.after ?? null}
			simulated={featured?.isSimulated}
			sizes="(min-width: 1320px) 1224px, 100vw"
			sweep
		/>
	</div>

	<div class="shell">
		<GalleryGrid {items} {vehicleTypes} />
	</div>
</section>

<style>
	.zone {
		background: var(--color-panel);
		padding-block: clamp(64px, 10vw, 136px);
	}

	h2 {
		font-family: var(--font-comic);
		font-size: clamp(3.5rem, 12vw, 9.5rem);
		font-weight: 400;
		line-height: 1;
		letter-spacing: 0.01em;
		color: var(--color-orange);
		transform: rotate(-1deg);
		transform-origin: left;
	}

	.lead {
		margin-top: 10px;
	}

	.stage {
		margin-block: clamp(24px, 4vw, 48px);
	}

	.stage :global(.featured) {
		aspect-ratio: 1;
		width: 100%;
		border-radius: 24px;
	}

	@media (min-width: 768px) {
		.stage :global(.featured) {
			aspect-ratio: 16 / 9;
		}

		.stage :global(.featured .compare-img) {
			object-position: 50% 58%;
		}
	}
</style>
