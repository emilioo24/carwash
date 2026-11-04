import { reservarAction } from '#lib/server/booking/action';
import { loadBookingData } from '#lib/server/booking/page-data';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const booking = await loadBookingData();
	// Un sitio estático no ve la query al compilar: en la demo la lee el navegador.
	const requested = __STATIC_DEMO__ ? null : url.searchParams.get('servicio');
	const preselectedServiceId = booking.services.find((s) => s.id === requested)?.id ?? null;

	return { ...booking, preselectedServiceId };
};

export const actions = (__STATIC_DEMO__ ? undefined : { reservar: reservarAction } satisfies Actions)!;
