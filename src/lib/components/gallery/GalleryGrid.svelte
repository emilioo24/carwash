<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { prefersReducedMotion } from '#lib/animations/motion';
	import { withBase } from '#lib/utils/paths';
	import Picture from '#lib/components/ui/Picture.svelte';
	import PhotoPlaceholder from '#lib/components/ui/PhotoPlaceholder.svelte';
	import type { GalleryItem, VehicleType } from '#lib/types';
	import GalleryModal from './GalleryModal.svelte';

	interface Props {
		items: GalleryItem[];
		vehicleTypes: VehicleType[];
	}

	let { items, vehicleTypes }: Props = $props();

	let filter = $state('todos');
	let selected = $state<GalleryItem | null>(null);
	let opener: HTMLElement | null = null;

	const filters = $derived([
		{ id: 'todos', label: 'Todos' },
		...vehicleTypes.map((type) => ({ id: type.id, label: type.pluralLabel }))
	]);
	const visible = $derived(
		filter === 'todos' ? items : items.filter((item) => item.vehicleType === filter)
	);
	const duration = $derived(prefersReducedMotion() ? 0 : 300);

	function open(event: MouseEvent, item: GalleryItem) {
		event.preventDefault();
		opener = event.currentTarget as HTMLElement;
		selected = item;
	}

	async function close() {
		selected = null;
		await tick(); // el foco solo puede volver cuando el dialog ya no está
		opener?.focus();
	}
</script>

{#if items.length === 0}
	<ul class="grid">
		{#each [1, 2, 3] as n (n)}
			<li class="tile"><PhotoPlaceholder /></li>
		{/each}
	</ul>
{:else}
	<div class="filters js-only" role="group" aria-label="Filtrar trabajos">
		{#each filters as option (option.id)}
			<button
				type="button"
				aria-pressed={filter === option.id}
				onclick={() => (filter = option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>

	<ul class="grid">
		{#each visible as item, index (item.id)}
			<li
				class="tile"
				class:wide={index % 7 === 0}
				animate:flip={{ duration }}
				in:fade={{ duration: duration * 0.7 }}
				out:fade={{ duration: duration * 0.4 }}
			>
				<a
					href={withBase(item.after)}
					aria-label="Ver {item.title} en grande"
					onclick={(event) => open(event, item)}
				>
					<Picture
						src={item.after}
						alt=""
						sizes={index % 7 === 0
							? '(min-width: 1024px) 640px, 100vw'
							: '(min-width: 1024px) 320px, 50vw'}
						class="tile-img"
					/>
					<span>{item.title}</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}

{#if selected}
	<GalleryModal item={selected} onclose={close} />
{/if}

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 24px;
	}

	.filters button {
		min-height: 44px;
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 8px 18px;
		font-weight: 600;
		color: var(--color-mist);
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s,
			transform 0.3s var(--bounce);
	}

	.filters button:hover {
		color: var(--color-paper);
	}

	.filters button[aria-pressed='true'] {
		border-color: var(--color-orange);
		background: var(--color-orange);
		color: var(--color-ink);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-auto-flow: dense;
		gap: clamp(8px, 1.2vw, 16px);
	}

	.tile {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 16px;
		background: var(--color-panel);
	}

	.tile.wide {
		grid-column: span 2;
		grid-row: span 2;
	}

	.tile a {
		position: absolute;
		inset: 0;
		display: block;
		border-radius: inherit;
	}

	.tile a:focus-visible {
		outline-offset: -4px;
	}

	.tile :global(.tile-img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
	}

	.tile a::after {
		content: '';
		position: absolute;
		inset: 45% 0 0;
		background: linear-gradient(to top, rgb(17 21 24 / 0.92), transparent);
		pointer-events: none;
	}

	.tile span {
		position: absolute;
		inset: auto 12px 10px;
		z-index: 1;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.25;
	}

	@media (hover: hover) {
		.tile a:hover :global(.tile-img) {
			transform: scale(1.05);
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.tile span {
			inset: auto 16px 14px;
			font-size: 1rem;
		}
	}
</style>
