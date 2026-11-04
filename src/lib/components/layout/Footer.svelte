<script lang="ts">
	import SocialIcon from '#lib/components/ui/SocialIcon.svelte';
	import { openingHoursText } from '#lib/utils/format';
	import { withBase } from '#lib/utils/paths';
	import type { BusinessSettings } from '#lib/types';
	import { LEGAL_LINKS, NAV_LINKS } from './nav-links';

	interface Props {
		settings: BusinessSettings;
	}

	let { settings }: Props = $props();

	const whatsapp = $derived(`https://wa.me/${settings.whatsapp.international}`);
	const year = new Date().getFullYear();
</script>

<footer>
	<div class="shell grid">
		<div class="brand">
			<img src={withBase('/img/logo-560.webp')} alt="Cars Wash" width="560" height="560" loading="lazy" />
			<div class="social">
				<a href={whatsapp} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">
					<SocialIcon name="whatsapp" size="24px" />
				</a>
				<a href={settings.instagram.url} target="_blank" rel="noopener" aria-label="Seguinos en Instagram">
					<SocialIcon name="instagram" size="24px" />
				</a>
			</div>
		</div>

		<nav aria-labelledby="footer-sections">
			<h2 id="footer-sections">El sitio</h2>
			<ul>
				{#each NAV_LINKS as link}
					<li><a href={withBase(link.href)}>{link.label}</a></li>
				{/each}
			</ul>
		</nav>

		<div>
			<h2>Dónde estamos</h2>
			<address>
				{settings.address.street}<br />
				{settings.address.area}, {settings.address.city}
			</address>
			<ul class="hours">
				{#each openingHoursText(settings) as row}
					<li>{row.days}: {row.hours}</li>
				{/each}
			</ul>
		</div>

		<nav aria-labelledby="footer-legal">
			<h2 id="footer-legal">Legales</h2>
			<ul>
				{#each LEGAL_LINKS as link}
					<li><a href={withBase(link.href)}>{link.label}</a></li>
				{/each}
			</ul>
		</nav>
	</div>

	<p class="shell copyright">© {year} {settings.name}. Rosario, Santa Fe.</p>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		background: #0c0f11;
		padding-block: 48px 104px;
		color: var(--color-mist);
	}

	.grid {
		display: grid;
		gap: 36px;
	}

	img {
		width: 132px;
		height: auto;
		border-radius: 18px;
	}

	.social {
		display: flex;
		gap: 10px;
		margin-top: 18px;
	}

	.social a {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
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

	h2 {
		margin-bottom: 12px;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-paper);
	}

	ul {
		display: grid;
		gap: 2px;
	}

	nav a {
		display: inline-block;
		padding-block: 5px;
		transition: color 0.2s;
	}

	nav a:hover {
		color: var(--color-orange);
	}

	address {
		font-style: normal;
		line-height: 1.5;
	}

	.hours {
		margin-top: 10px;
		line-height: 1.5;
	}

	.copyright {
		margin-top: 40px;
		font-size: 0.9375rem;
	}

	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		footer {
			padding-block: 64px 32px;
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: 1.1fr repeat(3, minmax(0, 1fr));
			gap: clamp(32px, 5vw, 72px);
		}

		.copyright {
			margin-top: 56px;
		}
	}
</style>
