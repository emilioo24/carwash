<script lang="ts">
	import SocialIcon from '#lib/components/ui/SocialIcon.svelte';
	import { openingHoursText } from '#lib/utils/format';
	import { withBase } from '#lib/utils/paths';
	import type { BusinessSettings } from '#lib/types';

	interface Props {
		settings: BusinessSettings;
	}

	let { settings }: Props = $props();

	const query = $derived(encodeURIComponent(settings.address.mapsQuery));
	const directions = $derived(`https://www.google.com/maps/dir/?api=1&destination=${query}`);
	const embed = $derived(`https://www.google.com/maps?q=${query}&output=embed`);
	const whatsapp = $derived(`https://wa.me/${settings.whatsapp.international}`);
</script>

<section id="contacto" class="section">
	<div class="shell layout">
		<div>
			<h2 class="heading" data-reveal>Contacto y ubicación</h2>

			<dl data-reveal>
				<div>
					<dt>Dirección</dt>
					<dd>
						<!-- TODO: confirmar dirección exacta (ver src/lib/data/settings.ts) -->
						{settings.address.street}<br />
						{settings.address.area}, {settings.address.city}
					</dd>
				</div>
				<div>
					<dt>Horarios</dt>
					<dd>
						{#each openingHoursText(settings) as row}
							<span class="row">{row.days}: {row.hours}</span>
						{/each}
					</dd>
				</div>
				<div>
					<dt>Escribinos</dt>
					<dd class="social">
						<a href={whatsapp} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">
							<SocialIcon name="whatsapp" size="26px" />
						</a>
						<a href={settings.instagram.url} target="_blank" rel="noopener" aria-label="Seguinos en Instagram">
							<SocialIcon name="instagram" size="26px" />
						</a>
					</dd>
				</div>
			</dl>

			<div class="actions" data-reveal>
				<a class="btn btn-primary" href={withBase('/reservar')}>Reservá tu turno</a>
				<a class="btn btn-outline" href={directions} target="_blank" rel="noopener">Cómo llegar</a>
			</div>
		</div>

		<div class="map" data-reveal>
			<iframe
				title="Ubicación de Cars Wash en Google Maps"
				src={embed}
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
			></iframe>
		</div>
	</div>
</section>

<style>
	.layout {
		display: grid;
		gap: clamp(32px, 5vw, 64px);
	}

	dl {
		display: grid;
		margin-block: clamp(24px, 4vw, 40px);
	}

	dl > div {
		display: grid;
		gap: 2px;
		border-top: 1px solid var(--line);
		padding-block: 14px;
	}

	dt {
		color: var(--color-mist);
		font-size: 0.9375rem;
	}

	dd {
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.4;
	}

	.social {
		display: flex;
		gap: 10px;
		margin-top: 4px;
	}

	.social a {
		display: grid;
		place-items: center;
		width: 52px;
		height: 52px;
		border: 1px solid var(--line);
		border-radius: 14px;
		color: var(--color-paper);
		transition:
			background-color 0.2s,
			border-color 0.2s,
			color 0.2s;
	}

	.social a:hover {
		border-color: var(--color-orange);
		background: var(--color-orange);
		color: var(--color-ink);
	}

	.row {
		display: block;
	}

	.actions {
		display: grid;
		gap: 10px;
	}

	.map {
		min-height: 340px;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: 24px;
		background: var(--color-panel);
	}

	iframe {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 340px;
		border: 0;
	}

	@media (min-width: 640px) {
		dl > div {
			grid-template-columns: 120px minmax(0, 1fr);
			gap: 16px;
		}

		.actions {
			display: flex;
			flex-wrap: wrap;
		}
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
			align-items: stretch;
		}
	}
</style>
