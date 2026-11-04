<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { pauseSmoothScroll, resumeSmoothScroll } from '#lib/animations/motion';
	import Picture from '#lib/components/ui/Picture.svelte';
	import type { GalleryItem } from '#lib/types';
	import CompareSlider from './CompareSlider.svelte';

	interface Props {
		item: GalleryItem;
		onclose: () => void;
	}

	let { item, onclose }: Props = $props();
	let dialog = $state<HTMLDialogElement>();

	onMount(() => {
		dialog?.showModal();
		pauseSmoothScroll();
		document.documentElement.style.overflow = 'hidden';

		return () => {
			resumeSmoothScroll();
			document.documentElement.style.overflow = '';
		};
	});

	function onBackdropClick(event: MouseEvent) {
		if (event.target === dialog) onclose();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	aria-label={item.title}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={onBackdropClick}
>
	<div class="panel" in:scale={{ start: 0.96, duration: 180 }}>
		<div class="bar">
			<h3>{item.title}</h3>
			<button class="btn btn-ghost close" type="button" onclick={onclose}>Cerrar</button>
		</div>
		{#if item.before}
			<CompareSlider
				class="modal-compare"
				title={item.title}
				before={item.before}
				after={item.after}
				simulated={item.isSimulated}
				sizes="(min-width: 800px) 720px, 100vw"
			/>
		{:else}
			<Picture src={item.after} alt={item.title} sizes="(min-width: 800px) 720px, 100vw" class="modal-photo" />
		{/if}
	</div>
</dialog>

<style>
	dialog {
		max-width: none;
		max-height: none;
		width: 100%;
		height: 100%;
		margin: 0;
		display: grid;
		place-items: center;
		border: 0;
		background: rgb(8 10 12 / 0.9);
		padding: 16px;
		color: inherit;
	}

	dialog::backdrop {
		background: transparent;
	}

	.panel {
		width: min(100%, 720px, calc(100dvh - 120px));
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 12px;
	}

	h3 {
		font-family: var(--font-display);
		font-size: clamp(1.375rem, 4vw, 2rem);
		font-weight: 400;
		line-height: 1.1;
		text-transform: uppercase;
	}

	.close {
		flex: none;
		min-height: 44px;
		padding: 6px 16px;
	}

	.panel :global(.modal-compare),
	.panel :global(.modal-photo) {
		aspect-ratio: 1;
		width: 100%;
		border-radius: 20px;
	}

	.panel :global(.modal-photo) {
		object-fit: cover;
	}
</style>
