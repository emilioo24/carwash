<script lang="ts">
	import { pictureSources } from '#lib/utils/images';

	interface Props {
		src: string;
		alt: string;
		sizes?: string;
		class?: string;
		priority?: boolean;
		width?: number;
		height?: number;
	}

	let {
		src,
		alt,
		sizes = '100vw',
		class: className = '',
		priority = false,
		width = 1440,
		height = 1440
	}: Props = $props();

	const sources = $derived(pictureSources(src));
</script>

<picture class="contents">
	{#if sources.avif}<source type="image/avif" srcset={sources.avif} {sizes} />{/if}
	{#if sources.webp}<source type="image/webp" srcset={sources.webp} {sizes} />{/if}
	<img
		src={sources.fallback}
		{alt}
		{width}
		{height}
		class={className}
		loading={priority ? 'eager' : 'lazy'}
		decoding={priority ? 'sync' : 'async'}
		fetchpriority={priority ? 'high' : 'auto'}
		draggable="false"
	/>
</picture>
