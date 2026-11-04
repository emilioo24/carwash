<script lang="ts">
	import LegalPage from '#lib/components/layout/LegalPage.svelte';

	let { data } = $props();

	const { name, address, whatsapp, instagram } = $derived(data.settings);
	const chat = $derived(`https://wa.me/${whatsapp.international}`);
</script>

<!-- TODO: que lo revise un abogado antes de publicar el sitio definitivo. -->
<LegalPage
	title="Política de privacidad"
	description="Qué datos pide el sitio de Cars Wash para reservar un turno, para qué se usan y cómo ejercer tus derechos."
	updated="3 de noviembre de 2026"
>
	<h2>Quién es responsable de tus datos</h2>
	<!-- TODO: agregar razón social y CUIT del titular. -->
	<p>
		{name}, con domicilio en {address.street}, {address.area}, {address.city}, {address.region}.
		Podés escribirnos por <a href={chat} target="_blank" rel="noopener">WhatsApp al {whatsapp.display}</a>.
	</p>

	<h2>Qué datos pedimos</h2>
	<p>Para preparar tu reserva te pedimos:</p>
	<ul>
		<li>Nombre completo y teléfono.</li>
		<li>Tipo de vehículo y servicio.</li>
		<li>Fecha y hora del turno.</li>
	</ul>

	<h2>Para qué los usamos</h2>
	<p>Solo para coordinar y confirmar tu turno. No los vendemos ni los usamos para enviarte publicidad.</p>

	<h2>Dónde quedan</h2>
	<!-- TODO(admin): actualizar cuando las reservas se guarden en Supabase. -->
	<p>
		Hoy el sitio no guarda tus datos en una base propia. Al reservar, se arma un mensaje que vos nos enviás por WhatsApp, y queda en esa conversación.
		<!-- TODO: confirmar con el dueño cuánto tiempo se conservan esas conversaciones. -->
	</p>

	<h2>Servicios de terceros</h2>
	<p>Al usar el sitio pueden intervenir estos servicios, cada uno con su propia política de privacidad:</p>
	<ul>
		<li>WhatsApp, si enviás tu reserva o nos escribís.</li>
		<li>Instagram, si abrís <a href={instagram.url} target="_blank" rel="noopener">nuestro perfil</a>.</li>
		<li>Google Maps, para mostrar el mapa de ubicación.</li>
		<li>Google Fonts, para cargar las tipografías del sitio.</li>
		<li>El proveedor que aloja el sitio, que puede registrar datos técnicos como tu dirección IP.</li>
	</ul>

	<h2>Cookies</h2>
	<p>
		El sitio no usa cookies propias ni herramientas de análisis o publicidad. El mapa de Google puede usar las suyas.
	</p>

	<h2>Tus derechos</h2>
	<p>
		Podés pedirnos acceder a tus datos, corregirlos o eliminarlos escribiéndonos por WhatsApp.
	</p>
	<p>
		El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley 25.326. La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.
	</p>

	<h2>Cambios</h2>
	<p>Si cambiamos esta política, vas a ver la nueva versión y su fecha en esta página.</p>
</LegalPage>
