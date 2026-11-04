<script lang="ts">
	import { withBase } from '#lib/utils/paths';
	import { onMount } from 'svelte';
	import { loadGsap, prefersReducedMotion } from '#lib/animations/motion';
	import Picture from '#lib/components/ui/Picture.svelte';

	interface Props {
		area: string;
	}

	let { area }: Props = $props();
	let list = $state<HTMLElement>();

	const steps = $derived([
		{
			title: 'Reservás online',
			text: 'Elegís el servicio, el día y la hora.',
			paths: ['M7 3v4M17 3v4', 'M4 7h16v14H4z', 'M4 11h16', 'M8 16l2.5 2.5L16 14']
		},
		{
			title: 'Traés tu auto',
			text: `Te esperamos en ${area}.`,
			paths: ['M3 16v-3l2.5-6h13L21 13v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z', 'M3.5 13h17', 'M7 17v2M17 17v2']
		},
		{
			title: 'Lo dejamos reluciente',
			text: 'Hacemos el lavado que elegiste.',
			paths: ['M12 3c-3.5 5-6 8-6 11.5a6 6 0 0 0 12 0C18 11 15.5 8 12 3Z', 'M9.5 15a2.6 2.6 0 0 0 2.5 2.5']
		},
		{
			title: 'Lo retirás',
			text: 'Pasás a buscarlo por el lavadero.',
			paths: ['M4 12.5 9.5 18 20 6.5']
		}
	]);

	onMount(() => {
		if (prefersReducedMotion() || !list) return;
		let context: { revert: () => void } | undefined;
		let cancelled = false;

		void loadGsap().then(({ gsap }) => {
			if (cancelled || !list) return;
			context = gsap.context(() => {
				const lines = list!.querySelectorAll('svg path');
				gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
				gsap.to(lines, {
					strokeDashoffset: 0,
					duration: 0.7,
					stagger: 0.09,
					ease: 'power1.inOut',
					scrollTrigger: { trigger: list!, start: 'top 75%', once: true }
				});
			}, list);
		});

		return () => {
			cancelled = true;
			context?.revert();
		};
	});
</script>

<section id="como-trabajamos" class="section">
	<div class="shell layout">
		<div>
			<h2 class="heading" data-reveal>Cómo trabajamos</h2>
			<ol bind:this={list}>
				{#each steps as step, index}
					<li data-reveal>
						<div class="icon">
							<svg viewBox="0 0 24 24" aria-hidden="true">
								{#each step.paths as path}
									<path d={path} pathLength="1" />
								{/each}
							</svg>
						</div>
						<div>
							<h3><span class="number">{index + 1}.</span> {step.title}</h3>
							<p>{step.text}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>

		<figure data-reveal>
			<Picture
				src={withBase('/img/proceso/espuma.webp')}
				alt="Auto cubierto de espuma durante el lavado"
				sizes="(min-width: 1024px) 460px, 100vw"
				width={640}
				height={852}
				class="process-photo"
			/>
		</figure>
	</div>
</section>

<style>
	.layout {
		display: grid;
		gap: clamp(32px, 6vw, 80px);
	}

	ol {
		display: grid;
		margin-top: clamp(28px, 4vw, 48px);
	}

	li {
		position: relative;
		display: flex;
		gap: 18px;
		padding-bottom: 32px;
	}

	/* La línea de agua que une los pasos. */
	li:not(:last-child)::before {
		content: '';
		position: absolute;
		top: 60px;
		bottom: 4px;
		left: 29px;
		width: 2px;
		background: linear-gradient(var(--color-water), rgb(43 143 179 / 0.25));
	}

	.icon {
		display: grid;
		flex: none;
		place-items: center;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: rgb(43 143 179 / 0.16);
	}

	svg {
		width: 32px;
		fill: none;
		stroke: var(--color-orange);
		stroke-width: 1.7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	h3 {
		margin-top: 4px;
		font-size: clamp(1.25rem, 2.2vw, 1.625rem);
		font-weight: 700;
		line-height: 1.25;
	}

	.number {
		color: var(--color-orange);
	}

	li p {
		color: var(--color-mist);
	}

	figure {
		overflow: hidden;
		border-radius: 24px;
		background: var(--color-panel);
		aspect-ratio: 4 / 5;
		align-self: center;
	}

	figure :global(.process-photo) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
			align-items: center;
		}
	}
</style>
