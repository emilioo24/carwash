<script lang="ts">
	import LegalPage from '#lib/components/layout/LegalPage.svelte';
	import { withBase } from '#lib/utils/paths';

	let { data } = $props();

	const { name, address, whatsapp } = $derived(data.settings);
	const chat = $derived(`https://wa.me/${whatsapp.international}`);
</script>

<!-- TODO: que lo revise un abogado antes de publicar el sitio definitivo. -->
<LegalPage
	title="Términos y condiciones"
	description="Condiciones para reservar un turno y usar el sitio de Cars Wash: precios, confirmación, cambios y cancelaciones."
	updated="3 de noviembre de 2026"
>
	<h2>Quiénes somos</h2>
	<!-- TODO: agregar razón social y CUIT del titular. -->
	<p>
		{name} es un lavadero de autos y camionetas ubicado en {address.street}, {address.area}, {address.city}, {address.region}. Al usar este sitio aceptás estos términos.
	</p>

	<h2>Servicios y precios</h2>
	<p>
		Los servicios y precios son los publicados en el sitio, en pesos argentinos. Pueden cambiar. El precio de tu turno es el que te confirmamos por WhatsApp.
		<!-- TODO: confirmar medios de pago aceptados. -->
	</p>

	<h2>Cómo funciona la reserva</h2>
	<p>
		Reservar desde <a href={withBase('/reservar')}>el formulario</a> es un pedido de turno: arma un mensaje que nos enviás por WhatsApp. El turno queda reservado cuando te lo confirmamos por ese medio.
	</p>
	<p>Los horarios que muestra el sitio son orientativos hasta recibir esa confirmación.</p>

	<h2>Cambios y cancelaciones</h2>
	<!-- TODO: confirmar con el dueño la anticipación pedida, la tolerancia por llegadas tarde y si hay cargos. -->
	<p>
		Si necesitás cambiar o cancelar tu turno, avisanos <a href={chat} target="_blank" rel="noopener">por WhatsApp</a> lo antes posible.
	</p>

	<!-- TODO: definir con el dueño y un abogado la responsabilidad sobre el vehículo y los objetos dejados en él. -->

	<h2>Contenido del sitio</h2>
	<p>
		Los textos, fotos y logos de este sitio pertenecen a {name} o se usan con autorización. No pueden copiarse sin permiso.
	</p>
	{#if __STATIC_DEMO__}
		<p>
			Esta es una versión de demostración. Las fotos rotuladas como simulación fueron retocadas para mostrar cómo funciona el comparador y no son trabajos reales.
		</p>
	{/if}

	<h2>Tus datos</h2>
	<p>
		Cómo tratamos tus datos está explicado en la <a href={withBase('/privacidad')}>política de privacidad</a>.
	</p>

	<h2>Tus derechos como consumidor</h2>
	<p>
		Estos términos se rigen por las leyes de la República Argentina y no limitan los derechos que te da la Ley 24.240 de Defensa del Consumidor.
	</p>

	<h2>Cambios</h2>
	<p>Si cambiamos estos términos, vas a ver la nueva versión y su fecha en esta página.</p>
</LegalPage>
