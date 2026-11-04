<script lang="ts">
	import Seo from '#lib/components/layout/Seo.svelte';
	import BeforeAfter from '#lib/components/sections/BeforeAfter.svelte';
	import Contact from '#lib/components/sections/Contact.svelte';
	import Hero from '#lib/components/sections/Hero.svelte';
	import HowWeWork from '#lib/components/sections/HowWeWork.svelte';
	import Services from '#lib/components/sections/Services.svelte';
	import { page } from '$app/state';
	import { openingHoursChip } from '#lib/utils/format';
	import { siteUrl } from '#lib/utils/paths';
	import { autoWashJsonLd } from '#lib/utils/seo';

	let { data } = $props();

	const chips = $derived([openingHoursChip(data.settings), 'Autos y camionetas', 'Reservá online']);
	const jsonLd = $derived(
		autoWashJsonLd(data.settings, data.services, data.vehicleTypes, siteUrl(page.url.origin))
	);
</script>

<Seo
	title="Cars Wash · Lavadero de autos premium en Rosario Zona Norte"
	description="Lavado exterior, aspirado y lavado completo de autos y camionetas en Zona Norte, Rosario. Mirá los precios y reservá online tu turno."
	image={data.settings.ogImage}
	{jsonLd}
/>

<Hero image={data.settings.heroImage} {chips} />
<Services services={data.services} vehicleTypes={data.vehicleTypes} initialVehicle={data.initialVehicle} />
<BeforeAfter items={data.gallery} vehicleTypes={data.vehicleTypes} featuredId={data.settings.featuredGalleryId} />
<HowWeWork area={data.settings.address.area} />
<Contact settings={data.settings} />
