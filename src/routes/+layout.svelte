<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import {
		dropStaleTriggers,
		initSmoothScroll,
		jumpAfterNavigation,
		revealPending
	} from '#lib/animations/motion';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import WhatsAppFloat from '#lib/components/layout/WhatsAppFloat.svelte';

	let { data, children } = $props();

	onMount(() => {
		void initSmoothScroll();
	});

	// El scroll suave se interrumpe si el contenido cambia a mitad de camino.
	beforeNavigate(({ from, to }) => {
		if (from?.route.id !== to?.route.id) document.documentElement.style.scrollBehavior = 'auto';
	});

	afterNavigate(({ from, to, type }) => {
		if (from && to && from.route.id !== to.route.id) {
			dropStaleTriggers();
			// Al volver atrás o adelante, SvelteKit ya restauró la posición.
			if (type !== 'popstate') jumpAfterNavigation(to.url.hash);
		}
		void revealPending();
		requestAnimationFrame(() => document.documentElement.style.removeProperty('scroll-behavior'));
	});
</script>

<a class="skip-link" href="#contenido">Saltar al contenido</a>
<Navbar />
<main id="contenido">
	{@render children()}
</main>
<!-- La página 404 de GitHub Pages no recibe datos del layout. -->
{#if data.settings}
	<Footer settings={data.settings} />
	<WhatsAppFloat phone={data.settings.whatsapp.international} name={data.settings.name} />
{/if}
