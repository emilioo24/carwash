<script lang="ts">
	import { page } from '$app/state';
	import { withBase } from '#lib/utils/paths';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Página no encontrada' : 'Algo salió mal'} · Cars Wash</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="section shell">
	<h1 class="heading">{notFound ? 'Esta página no existe' : 'No pudimos cargar la página'}</h1>
	<p class="lead">
		{notFound ? 'Puede que el link esté mal escrito.' : 'Probá de nuevo en un rato.'} Desde el inicio podés ver los servicios y reservar tu turno.
	</p>
	<a class="btn btn-primary" href={withBase('/')}>Ir al inicio</a>
</section>

<style>
	section {
		display: grid;
		justify-items: start;
		gap: 24px;
		min-height: 70svh;
		align-content: center;
	}
</style>
