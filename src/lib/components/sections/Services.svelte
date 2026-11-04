<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { isLightDevice, loadGsap, prefersReducedMotion } from '#lib/animations/motion';
	import { formatPrice } from '#lib/utils/format';
	import { withBase } from '#lib/utils/paths';
	import type { Service, VehicleType } from '#lib/types';

	interface Props {
		services: Service[];
		vehicleTypes: VehicleType[];
		initialVehicle: string;
	}

	let { services, vehicleTypes, initialVehicle }: Props = $props();

	// svelte-ignore state_referenced_locally
	let vehicle = $state(initialVehicle);
	let shownPrices = $state<number[] | null>(null);
	let cards = $state<HTMLElement>();
	let busy = false;

	const visible = $derived(services.filter((s) => s.vehicleTypeId === vehicle));
	const activeIndex = $derived(Math.max(0, vehicleTypes.findIndex((v) => v.id === vehicle)));

	onMount(() => {
		if (!__STATIC_DEMO__) return;
		const requested = page.url.searchParams.get('vehiculo');
		if (vehicleTypes.some((type) => type.id === requested)) vehicle = requested as string;
	});

	async function select(event: MouseEvent, next: string) {
		event.preventDefault();
		if (next === vehicle || busy) return;

		const from = visible.map((s) => s.priceArs);
		if (prefersReducedMotion() || !cards) {
			vehicle = next;
			return;
		}

		busy = true;
		const { gsap } = await loadGsap();
		const flip = !isLightDevice();
		const items = [...cards.children];

		await gsap.to(items, {
			opacity: 0,
			rotationY: flip ? 80 : 0,
			duration: 0.2,
			ease: 'power2.in',
			stagger: 0.04
		});

		vehicle = next;
		const to = services.filter((s) => s.vehicleTypeId === next).map((s) => s.priceArs);
		const counter = { progress: 0 };
		shownPrices = from;
		await tick();

		const fresh = [...cards.children];
		gsap.fromTo(
			fresh,
			{ opacity: 0, rotationY: flip ? -80 : 0 },
			{
				opacity: 1,
				rotationY: 0,
				duration: 0.38,
				ease: 'power2.out',
				stagger: 0.05,
				clearProps: 'transform'
			}
		);
		await gsap.to(counter, {
			progress: 1,
			duration: 0.75,
			ease: 'power2.out',
			onUpdate: () => {
				shownPrices = to.map((price, i) => {
					const start = from[i] ?? price;
					return Math.round((start + (price - start) * counter.progress) / 100) * 100;
				});
			}
		});
		shownPrices = null;
		busy = false;
	}
</script>

<section id="servicios" class="section">
	<div class="shell">
		<div class="head" data-reveal>
			<h2 class="heading">Servicios y precios</h2>
			<div class="toggle" style:--active={activeIndex} style:--count={vehicleTypes.length}>
				<span class="thumb" aria-hidden="true"></span>
				{#each vehicleTypes as type}
					<a
						href="?vehiculo={type.id}#servicios"
						aria-current={type.id === vehicle ? 'true' : undefined}
						data-sveltekit-noscroll
						onclick={(event) => select(event, type.id)}
					>
						{type.shortLabel}
					</a>
				{/each}
			</div>
		</div>

		<div class="cards" bind:this={cards} aria-live="polite">
			{#each visible as service, index (service.id)}
				<article class:popular={service.isPopular} data-reveal>
					{#if service.isPopular}
						<!-- TODO: confirmar "El más elegido" con el dueño -->
						<p class="sticker">El más elegido</p>
					{/if}
					<h3>{service.name}</h3>
					<p class="includes">{service.description}</p>
					<p class="price">{formatPrice(shownPrices?.[index] ?? service.priceArs)}</p>
					<a
						class="btn {service.isPopular ? 'btn-primary' : 'btn-outline'}"
						href={withBase(`/reservar?servicio=${service.id}`)}
					>
						Reservar este servicio
					</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px 40px;
		margin-bottom: clamp(32px, 5vw, 64px);
	}

	.toggle {
		position: relative;
		display: grid;
		grid-template-columns: repeat(var(--count), minmax(0, 1fr));
		width: min(100%, 340px);
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--color-panel);
		padding: 5px;
	}

	.thumb {
		position: absolute;
		inset-block: 5px;
		left: 5px;
		width: calc((100% - 10px) / var(--count));
		border-radius: 12px;
		background: var(--color-orange);
		transform: translateX(calc(var(--active) * 100%));
		transition: transform 0.38s var(--bounce);
	}

	.toggle a {
		position: relative;
		padding: 11px 12px;
		text-align: center;
		font-weight: 700;
		color: var(--color-mist);
		transition: color 0.2s;
	}

	.toggle a[aria-current] {
		color: var(--color-ink);
	}

	.cards {
		display: grid;
		gap: 16px;
		perspective: 1400px;
	}

	article {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		border: 1px solid var(--line);
		border-radius: 24px;
		background: var(--color-panel);
		padding: clamp(24px, 4vw, 44px);
		backface-visibility: hidden;
	}

	article.popular {
		border: 2px solid var(--color-orange);
		background:
			radial-gradient(circle at 100% 0, rgb(43 143 179 / 0.22), transparent 54%),
			var(--color-panel);
	}

	.sticker {
		position: absolute;
		top: -15px;
		right: clamp(16px, 3vw, 32px);
		border-radius: 10px;
		background: var(--color-red);
		padding: 2px 13px;
		font-family: var(--font-comic);
		font-size: 1.3125rem;
		letter-spacing: 0.04em;
		transform: rotate(-3deg);
	}

	h3 {
		font-size: clamp(1.25rem, 2.3vw, 1.625rem);
		font-weight: 700;
		line-height: 1.2;
	}

	.includes {
		max-width: 38ch;
		margin-top: 8px;
		color: var(--color-mist);
	}

	.price {
		margin-block: clamp(20px, 3vw, 32px);
		font-family: var(--font-display);
		font-size: clamp(4rem, 10vw, 7.5rem);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	article .btn {
		width: 100%;
		margin-top: auto;
	}

	@media (min-width: 768px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 24px;
		}
	}
</style>
