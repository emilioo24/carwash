<script lang="ts">
	import BookingForm from '#lib/components/booking/BookingForm.svelte';
	import { withBase } from '#lib/utils/paths';
	import type { BookingFormState, ISODate, Service, VehicleType } from '#lib/types';

	interface Props {
		form: BookingFormState | null | undefined;
		services: Service[];
		vehicleTypes: VehicleType[];
		today: ISODate;
		bookableDates: ISODate[];
		fallbackHours: string[];
		preselectedServiceId?: string | null;
	}

	let { ...formProps }: Props = $props();
</script>

<section id="reservas" class="zone">
	<img class="splash" src={withBase('/img/splash.webp')} alt="" width="590" height="215" loading="lazy" />
	<div class="shell inner">
		<h1 class="heading" data-reveal>Reservá tu turno</h1>
		<div class="card" data-reveal>
			<BookingForm {...formProps} />
		</div>
	</div>
</section>

<style>
	.zone {
		position: relative;
		overflow: clip;
		background: var(--color-panel);
		padding-block: clamp(64px, 10vw, 136px);
	}

	/* Cuelga del borde superior, como si la salpicadura viniera de arriba. */
	.splash {
		position: absolute;
		top: -6px;
		right: clamp(-90px, -4vw, -20px);
		width: clamp(250px, 44vw, 660px);
		transform: scaleY(-1);
		opacity: 0.9;
		pointer-events: none;
	}

	.inner {
		position: relative;
	}

	.card {
		margin-top: clamp(28px, 4vw, 48px);
	}
</style>
