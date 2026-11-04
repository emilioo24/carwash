<script lang="ts">
	import { page } from '$app/state';
	import { withBase } from '#lib/utils/paths';

	interface Props {
		title: string;
		description: string;
		image: string;
		jsonLd?: string;
	}

	let { title, description, image, jsonLd }: Props = $props();

	const canonical = $derived(`${page.url.origin}${page.url.pathname}`);
	const imageUrl = $derived(`${page.url.origin}${withBase(image)}`);
	const script = $derived(jsonLd ? `<script type="application/ld+json">${jsonLd}<\/script>` : '');
</script>

<svelte:head>
	<title>{title}</title>
	{#if __STATIC_DEMO__}<meta name="robots" content="noindex" />{/if}
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="es_AR" />
	<meta property="og:site_name" content="Cars Wash" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html script}
</svelte:head>
