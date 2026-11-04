<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import SocialIcon from '#lib/components/ui/SocialIcon.svelte';
	import { bookingSummary, formatPrice } from '#lib/utils/format';
	import { withBase } from '#lib/utils/paths';
	import type { BookingFormState, ISODate, Service, TimeSlot, VehicleType } from '#lib/types';
	import Calendar from './Calendar.svelte';
	import Success from './Success.svelte';

	interface Props {
		form: BookingFormState | null | undefined;
		services: Service[];
		vehicleTypes: VehicleType[];
		today: ISODate;
		bookableDates: ISODate[];
		fallbackHours: string[];
		preselectedServiceId?: string | null;
	}

	let {
		form,
		services,
		vehicleTypes,
		today,
		bookableDates,
		fallbackHours,
		preselectedServiceId = null
	}: Props = $props();

	/* svelte-ignore state_referenced_locally */
	const initialService = services.find((s) => s.id === (form?.values?.serviceId ?? preselectedServiceId));

	/* svelte-ignore state_referenced_locally */
	let fullName = $state(form?.values?.fullName ?? '');
	/* svelte-ignore state_referenced_locally */
	let phone = $state(form?.values?.phone ?? '');
	/* svelte-ignore state_referenced_locally */
	let vehicleId = $state(initialService?.vehicleTypeId ?? form?.values?.vehicleTypeId ?? vehicleTypes[0]?.id ?? '');
	let serviceId = $state(initialService?.id ?? '');
	/* svelte-ignore state_referenced_locally */
	let date = $state(form?.values?.date ?? '');
	/* svelte-ignore state_referenced_locally */
	let time = $state(form?.values?.time ?? '');

	let slots = $state<TimeSlot[] | null>(null);
	let slotsLoading = $state(false);
	let slotsFailed = $state(false);
	let hydrated = $state(false);
	let submitting = $state(false);
	let dismissed = $state(false);
	let clientErrors = $state<Record<string, string[] | undefined> | null>(null);
	let formElement = $state<HTMLFormElement>();
	// Solo en la demo estática: las fechas del build envejecen y no hay servidor que responda.
	/* svelte-ignore state_referenced_locally */
	let liveToday = $state(today);
	/* svelte-ignore state_referenced_locally */
	let liveDates = $state(bookableDates);
	let demoResult = $state<{ whatsappUrl: string; summary: string } | null>(null);

	const errors = $derived(clientErrors ?? form?.errors ?? {});
	const success = $derived(dismissed ? null : (demoResult ?? (form?.success && form.whatsappUrl ? form : null)));
	const vehicle = $derived(vehicleTypes.find((v) => v.id === vehicleId));
	const service = $derived(services.find((s) => s.id === serviceId));
	const summary = $derived(
		bookingSummary({
			vehicle: vehicle?.shortLabel,
			service: service?.name,
			date: date || undefined,
			time: time || undefined,
			price: service?.priceArs
		})
	);

	const errorId = (field: string) => `error-${field}`;

	function chooseVehicle(id: string) {
		vehicleId = id;
		if (service && service.vehicleTypeId !== id) serviceId = '';
		clearError('vehicleTypeId');
	}

	function clearError(field: string) {
		if (clientErrors?.[field]) clientErrors = { ...clientErrors, [field]: undefined };
	}

	async function fetchSlots(day: ISODate): Promise<TimeSlot[]> {
		if (__STATIC_DEMO__) {
			const { demoSlots } = await import('#lib/booking/static-demo');
			return demoSlots(day);
		}
		const response = await fetch(withBase(`/api/slots?date=${day}`));
		if (!response.ok) throw new Error(String(response.status));
		const body: { slots: TimeSlot[] } = await response.json();
		return body.slots;
	}

	let requestId = 0;
	async function loadSlots(day: ISODate) {
		const id = ++requestId;
		slotsLoading = true;
		slotsFailed = false;
		try {
			const next = await fetchSlots(day);
			if (id !== requestId) return;
			slots = next;
			if (!next.some((slot) => slot.time === time)) time = '';
		} catch {
			if (id === requestId) {
				slots = null;
				slotsFailed = true;
			}
		} finally {
			if (id === requestId) slotsLoading = false;
		}
	}

	function chooseDate(day: ISODate) {
		date = day;
		time = '';
		clearError('date');
		void loadSlots(day);
	}

	onMount(() => {
		hydrated = true;
		if (date) void loadSlots(date);
		if (__STATIC_DEMO__) void startDemo();
	});

	async function startDemo() {
		const requested = services.find((s) => s.id === page.url.searchParams.get('servicio'));
		if (requested) {
			vehicleId = requested.vehicleTypeId;
			serviceId = requested.id;
		}
		const { demoBookableDates, demoToday } = await import('#lib/booking/static-demo');
		liveToday = demoToday();
		liveDates = demoBookableDates();
	}

	async function focusFirstError() {
		await tick();
		const target = formElement?.querySelector<HTMLElement>('.field:has(.field-error)');
		target?.scrollIntoView({ block: 'center' });
		target?.querySelector<HTMLElement>('input:not([type="hidden"]):not(:disabled), select, button:not(:disabled)')?.focus({ preventScroll: true });
	}

	function reset() {
		dismissed = true;
		fullName = phone = serviceId = date = time = '';
		slots = null;
		clientErrors = null;
		demoResult = null;
	}
</script>

{#if success}
	<Success summary={success.summary ?? ''} whatsappUrl={success.whatsappUrl ?? ''} onreset={reset} />
{:else}
	{#if __STATIC_DEMO__}
		<noscript>
			<p class="hint no-script">
				Para reservar desde esta demo hace falta JavaScript. También podés
				<a href="https://wa.me/{page.data.settings?.whatsapp.international}" aria-label="escribirnos por WhatsApp">escribirnos <SocialIcon name="whatsapp" /></a>.
			</p>
		</noscript>
	{/if}
	<form
		bind:this={formElement}
		method="POST"
		action="?/reservar"
		novalidate
		use:enhance={async ({ formData, cancel }) => {
			const { bookingSchema } = await import('#lib/schemas/booking');
			const { z } = await import('zod');
			const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				clientErrors = z.flattenError(parsed.error).fieldErrors;
				cancel();
				void focusFirstError();
				return;
			}
			clientErrors = null;
			dismissed = false;

			if (__STATIC_DEMO__) {
				cancel();
				const { submitDemoBooking } = await import('#lib/booking/static-demo');
				const result = await submitDemoBooking(
					Object.fromEntries(formData) as Record<string, string>,
					services,
					vehicleTypes
				);
				if (result.ok) {
					demoResult = { whatsappUrl: result.whatsappUrl, summary: result.summary };
					window.open(result.whatsappUrl, '_blank', 'noopener');
				} else {
					clientErrors = result.errors;
					if (date) void loadSlots(date);
					void focusFirstError();
				}
				return;
			}

			submitting = true;

			return async ({ result, update }) => {
				submitting = false;
				if (result.type === 'success' && result.data?.whatsappUrl) {
					window.open(String(result.data.whatsappUrl), '_blank', 'noopener');
				}
				await update({ reset: false });
				if (result.type === 'failure') {
					if (date) void loadSlots(date);
					void focusFirstError();
				}
			};
		}}
	>
		<div class="column">
			<div class="field">
				<label for="fullName">Nombre completo</label>
				<input
					id="fullName"
					name="fullName"
					type="text"
					autocomplete="name"
					bind:value={fullName}
					oninput={() => clearError('fullName')}
					aria-invalid={errors.fullName ? 'true' : undefined}
					aria-describedby={errors.fullName ? errorId('fullName') : undefined}
				/>
				{#if errors.fullName}<p class="field-error" id={errorId('fullName')}>{errors.fullName[0]}</p>{/if}
			</div>

			<div class="field">
				<label for="phone">Teléfono</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					inputmode="tel"
					autocomplete="tel"
					placeholder="341 000-0000"
					bind:value={phone}
					oninput={() => clearError('phone')}
					aria-invalid={errors.phone ? 'true' : undefined}
					aria-describedby={errors.phone ? errorId('phone') : undefined}
				/>
				{#if errors.phone}<p class="field-error" id={errorId('phone')}>{errors.phone[0]}</p>{/if}
			</div>

			<fieldset class="field" aria-describedby={errors.vehicleTypeId ? errorId('vehicleTypeId') : undefined}>
				<legend>Vehículo</legend>
				<div class="vehicles">
					{#each vehicleTypes as type (type.id)}
						<label class="vehicle" class:checked={vehicleId === type.id}>
							<input
								type="radio"
								name="vehicleTypeId"
								value={type.id}
								checked={vehicleId === type.id}
								onchange={() => chooseVehicle(type.id)}
							/>
							<span>{type.shortLabel}</span>
						</label>
					{/each}
				</div>
				{#if errors.vehicleTypeId}<p class="field-error" id={errorId('vehicleTypeId')}>{errors.vehicleTypeId[0]}</p>{/if}
			</fieldset>

			<fieldset class="field" aria-describedby={errors.serviceId ? errorId('serviceId') : undefined}>
				<legend>Servicio</legend>
				<div class="services">
					{#each services as item (item.id)}
						<label
							class="service"
							class:checked={serviceId === item.id}
							class:other-vehicle={item.vehicleTypeId !== vehicleId}
						>
							<input
								type="radio"
								name="serviceId"
								value={item.id}
								checked={serviceId === item.id}
								disabled={hydrated && item.vehicleTypeId !== vehicleId}
								data-invalid={errors.serviceId ? 'true' : undefined}
								onchange={() => {
									serviceId = item.id;
									clearError('serviceId');
								}}
							/>
							<span class="service-name">
								{item.name}
								<small class="no-js-only">{vehicleTypes.find((v) => v.id === item.vehicleTypeId)?.shortLabel}</small>
							</span>
							<span class="service-price">{formatPrice(item.priceArs)}</span>
						</label>
					{/each}
				</div>
				{#if errors.serviceId}<p class="field-error" id={errorId('serviceId')}>{errors.serviceId[0]}</p>{/if}
			</fieldset>
		</div>

		<div class="column">
			<!-- Sin JS: fecha y hora nativas. El servidor valida igual. -->
			{#if !hydrated}
				<div class="field no-js-only">
					<label for="date-native">Fecha</label>
					<input
						id="date-native"
						type="date"
						name="date"
						min={today}
						max={bookableDates.at(-1)}
						value={date}
						aria-invalid={errors.date ? 'true' : undefined}
					/>
					{#if errors.date}<p class="field-error">{errors.date[0]}</p>{/if}
				</div>
				<div class="field no-js-only">
					<label for="time-native">Hora</label>
					<select id="time-native" name="time" aria-invalid={errors.time ? 'true' : undefined}>
						<option value="">Elegí un horario</option>
						{#each fallbackHours as hour}
							<option value={hour} selected={time === hour}>{hour}</option>
						{/each}
					</select>
					{#if errors.time}<p class="field-error">{errors.time[0]}</p>{/if}
				</div>
			{/if}

			<div class="field js-only">
				<p class="label" id="date-label">Fecha</p>
				{#key liveToday}
					<Calendar
						today={liveToday}
						bookableDates={liveDates}
						value={date}
						onselect={chooseDate}
						describedBy={errors.date ? errorId('date') : 'date-label'}
					/>
				{/key}
				{#if hydrated}<input type="hidden" name="date" value={date} />{/if}
				{#if errors.date}<p class="field-error" id={errorId('date')}>{errors.date[0]}</p>{/if}
			</div>

			<fieldset class="field js-only" aria-describedby={errors.time ? errorId('time') : undefined}>
				<legend>Hora</legend>
				{#if !date}
					<p class="hint">Elegí una fecha para ver los horarios.</p>
				{:else if slotsLoading && !slots}
					<p class="hint" aria-live="polite">Buscando horarios…</p>
				{:else if slotsFailed}
					<p class="field-error">
						No pudimos cargar los horarios. <button type="button" class="retry" onclick={() => loadSlots(date)}>Reintentar</button>
					</p>
				{:else if slots?.length === 0}
					<p class="hint">Ya no quedan turnos para ese día. Elegí otra fecha.</p>
				{:else if slots}
					<div class="slots" class:loading={slotsLoading}>
						{#each slots as slot (slot.time)}
							<label class="slot" class:checked={time === slot.time}>
								<input
									type="radio"
									name="time"
									value={slot.time}
									disabled={!slot.available}
									checked={time === slot.time}
									data-invalid={errors.time ? 'true' : undefined}
									onchange={() => {
										time = slot.time;
										clearError('time');
									}}
								/>
								<span>{slot.time}</span>
							</label>
						{/each}
					</div>
				{/if}
				{#if errors.time}<p class="field-error" id={errorId('time')}>{errors.time[0]}</p>{/if}
			</fieldset>

			<div class="summary js-only" aria-live="polite">
				<p class="summary-label">Tu turno</p>
				{#key summary}
					<p class="summary-text" in:fade={{ duration: 160 }}>{summary || 'Elegí vehículo, servicio, fecha y hora.'}</p>
				{/key}
			</div>

			<button class="btn btn-primary submit" type="submit" disabled={submitting} aria-label="Reservar por WhatsApp">
				{#if submitting}
					Enviando…
				{:else}
					<SocialIcon name="whatsapp" />
					Reservar
				{/if}
			</button>
			<p class="consent">
				Al reservar aceptás los <a href={withBase('/terminos')}>términos y condiciones</a> y la
				<a href={withBase('/privacidad')}>política de privacidad</a>.
			</p>
		</div>
	</form>
{/if}

<style>
	form {
		display: grid;
		gap: clamp(24px, 4vw, 48px);
		align-items: start;
	}

	.column {
		display: grid;
		gap: 22px;
		min-width: 0;
	}

	fieldset {
		min-width: 0;
		border: 0;
	}

	label:not(.vehicle, .service, .slot),
	legend,
	.label {
		display: block;
		margin-bottom: 8px;
		padding: 0;
		font-weight: 600;
	}

	input:not([type='radio'], [type='hidden']),
	select {
		width: 100%;
		min-height: 52px;
		border: 1px solid rgb(244 246 248 / 0.28);
		border-radius: 14px;
		background: var(--color-ink);
		padding: 12px 16px;
		font: inherit;
		font-size: 1rem;
		color: var(--color-paper);
	}

	input::placeholder {
		color: var(--color-mist);
		opacity: 0.8;
	}

	[aria-invalid='true']:not([type='radio']) {
		border-color: #ff6b63;
	}

	.field-error {
		margin-top: 7px;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #ff8d86;
	}

	.retry {
		text-decoration: underline;
		cursor: pointer;
	}

	.vehicles {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}

	input[type='radio'] {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.vehicle,
	.service,
	.slot {
		position: relative;
		border: 2px solid var(--line);
		border-radius: 14px;
		background: var(--color-ink);
		cursor: pointer;
		transition:
			border-color 0.15s,
			background-color 0.15s,
			color 0.15s,
			scale 0.28s var(--bounce);
	}

	.vehicle:hover,
	.service:hover,
	.slot:hover {
		border-color: rgb(244 246 248 / 0.45);
	}

	.vehicle:has(input:focus-visible),
	.service:has(input:focus-visible),
	.slot:has(input:focus-visible) {
		outline: 3px solid var(--color-orange);
		outline-offset: 3px;
	}

	.vehicle {
		display: grid;
		place-items: center;
		min-height: 68px;
		font-family: var(--font-display);
		font-size: 1.5rem;
		text-transform: uppercase;
	}

	.vehicle.checked,
	.slot.checked {
		border-color: var(--color-orange);
		background: var(--color-orange);
		color: var(--color-ink);
		scale: 1.015;
	}

	.services {
		display: grid;
		gap: 10px;
	}

	.service {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		min-height: 62px;
		padding: 12px 16px;
	}

	:global(.js) .service.other-vehicle {
		display: none;
	}

	.service.checked {
		border-color: var(--color-orange);
		background: rgb(242 145 27 / 0.12);
	}

	.service-name {
		font-weight: 600;
		line-height: 1.3;
	}

	small {
		display: block;
		font-weight: 400;
		color: var(--color-mist);
	}

	.service-price {
		flex: none;
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--color-orange);
	}

	.hint {
		border: 1px dashed var(--line);
		border-radius: 14px;
		padding: 14px 16px;
		color: var(--color-mist);
	}

	.slots {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
		gap: 8px;
		transition: opacity 0.15s;
	}

	.slots.loading {
		opacity: 0.5;
	}

	.slot {
		display: grid;
		place-items: center;
		min-height: 48px;
		font-weight: 600;
	}

	.slot:has(input:disabled) {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.no-script {
		margin-bottom: 24px;
	}

	.no-script a {
		text-decoration: underline;
	}

	.summary {
		border-left: 4px solid var(--color-water);
		border-radius: 0 12px 12px 0;
		background: var(--color-ink);
		padding: 12px 16px;
	}

	.summary-label {
		font-size: 0.8125rem;
		color: var(--color-mist);
	}

	.summary-text {
		font-weight: 700;
		line-height: 1.4;
	}

	.consent {
		font-size: 0.875rem;
		color: var(--color-mist);
	}

	.consent a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.submit {
		width: 100%;
		min-height: 58px;
		font-size: 1.0625rem;
	}

	@media (min-width: 960px) {
		form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
