<script lang="ts">
	import Seo from '#lib/components/layout/Seo.svelte';
	import Booking from '#lib/components/sections/Booking.svelte';

	let { data, form } = $props();
</script>

<Seo
	title="Reservá tu turno · Cars Wash Rosario"
	description="Reservá online tu turno de lavado para auto o camioneta en Zona Norte, Rosario. Elegí servicio, fecha y hora, y confirmá por WhatsApp."
	image={data.settings.ogImage}
/>

<div class="page">
	<Booking
		{form}
		services={data.services}
		vehicleTypes={data.vehicleTypes}
		today={data.today}
		bookableDates={data.bookableDates}
		fallbackHours={data.fallbackHours}
		preselectedServiceId={data.preselectedServiceId}
	/>
</div>

<style>
	.page {
		padding-top: var(--nav-height);
	}
</style>
