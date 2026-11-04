<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Seo from './Seo.svelte';

	interface Props {
		title: string;
		description: string;
		updated: string;
		children: Snippet;
	}

	let { title, description, updated, children }: Props = $props();
</script>

<Seo title="{title} · Cars Wash" {description} image={page.data.settings.ogImage} />

<article class="section shell">
	<h1 class="heading">{title}</h1>
	<p class="updated">Última actualización: {updated}</p>
	<div class="body">
		{@render children()}
	</div>
</article>

<style>
	article {
		padding-top: calc(var(--nav-height) + clamp(32px, 6vw, 72px));
	}

	.updated {
		margin-top: 12px;
		color: var(--color-mist);
	}

	.body {
		display: grid;
		gap: 16px;
		max-width: 68ch;
		margin-top: clamp(28px, 4vw, 48px);
		line-height: 1.65;
	}

	.body :global(h2) {
		margin-top: 20px;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.3;
	}

	.body :global(ul) {
		display: grid;
		gap: 6px;
		list-style: disc;
		padding-left: 1.25em;
	}

	.body :global(a) {
		color: var(--color-orange);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
