<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { withBase } from '#lib/utils/paths';
	import { NAV_LINKS } from './nav-links';

	let scrolled = $state(false);
	let menu = $state<HTMLDetailsElement>();

	const solid = $derived(scrolled || page.route.id !== '/');

	onMount(() => {
		const update = () => {
			scrolled = scrollY > 24;
		};
		update();
		addEventListener('scroll', update, { passive: true });
		return () => removeEventListener('scroll', update);
	});

	const closeMenu = () => {
		if (menu) menu.open = false;
	};
</script>

<header class:solid>
	<nav class="shell" aria-label="Principal">
		<a class="brand" href={withBase('/')} aria-label="Cars Wash, inicio">
			<img src={withBase('/img/logo-nav.webp')} alt="" width="320" height="167" />
		</a>

		<ul class="links">
			{#each NAV_LINKS as link}
				<li><a href={withBase(link.href)}>{link.label}</a></li>
			{/each}
		</ul>

		<a class="btn btn-primary cta" href={withBase('/reservar')}>Reservá tu turno</a>

		<details class="menu" bind:this={menu}>
			<summary aria-label="Abrir o cerrar el menú">
				<span></span><span></span><span></span>
			</summary>
			<ul>
				{#each NAV_LINKS as link}
					<li><a href={withBase(link.href)} onclick={closeMenu}>{link.label}</a></li>
				{/each}
			</ul>
		</details>
	</nav>
</header>

<style>
	header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 40;
		border-bottom: 1px solid transparent;
		transition:
			background-color 0.3s,
			border-color 0.3s;
	}

	header.solid {
		border-bottom-color: var(--line);
		background: rgb(17 21 24 / 0.98);
	}

	nav {
		display: flex;
		align-items: center;
		gap: 16px;
		height: var(--nav-height);
	}

	.brand {
		flex: none;
		margin-right: auto;
	}

	.brand img {
		width: auto;
		height: 54px;
		filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.75));
	}

	.links {
		display: none;
		gap: clamp(14px, 2vw, 28px);
	}

	.links a {
		position: relative;
		padding-block: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.links a::after {
		content: '';
		position: absolute;
		inset: auto 0 2px;
		height: 2px;
		background: var(--color-orange);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.25s;
	}

	.links a:hover::after {
		transform: scaleX(1);
	}

	.cta {
		min-height: 42px;
		padding: 8px 14px;
		font-size: 0.875rem;
		white-space: nowrap;
		border-radius: 12px;
	}

	.menu summary {
		display: grid;
		place-content: center;
		gap: 5px;
		width: 44px;
		height: 44px;
		cursor: pointer;
		list-style: none;
	}

	.menu summary::-webkit-details-marker {
		display: none;
	}

	.menu summary span {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--color-paper);
		transition: transform 0.2s;
	}

	.menu[open] summary span:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.menu[open] summary span:nth-child(2) {
		transform: scaleX(0);
	}

	.menu[open] summary span:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	.menu ul {
		position: absolute;
		inset: var(--nav-height) 0 auto;
		display: grid;
		border-bottom: 1px solid var(--line);
		background: var(--color-ink);
		padding: 8px 16px 20px;
	}

	.menu li a {
		display: block;
		border-bottom: 1px solid var(--line);
		padding-block: 14px;
		font-family: var(--font-display);
		font-size: 1.5rem;
		text-transform: uppercase;
	}

	@media (min-width: 1080px) {
		.links {
			display: flex;
		}

		.menu {
			display: none;
		}

		.cta {
			padding-inline: 20px;
			font-size: 0.9375rem;
		}

		.brand img {
			height: 60px;
		}
	}
</style>
