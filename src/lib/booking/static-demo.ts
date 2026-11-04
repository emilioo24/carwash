/**
 * Solo para el build de GitHub Pages, que no tiene servidor: los turnos y la
 * reserva se resuelven en el navegador. Cuando la web pase a Cloudflare, nada
 * de esto llega al bundle.
 */
import { blockedSlots } from '#lib/data/blocked-slots';
import { settings } from '#lib/data/settings';
import { computeBookableDates, computeSlots } from '#lib/utils/availability';
import { localDate } from '#lib/utils/date';
import type { ISODate, Service, VehicleType } from '#lib/types';

export const demoToday = () => localDate(new Date(), settings.timezone);

export const demoBookableDates = () => computeBookableDates(settings, blockedSlots, new Date());

export const demoSlots = (date: ISODate) => computeSlots(settings, blockedSlots, date, new Date());

export async function submitDemoBooking(
	values: Record<string, string>,
	services: Service[],
	vehicleTypes: VehicleType[]
) {
	// Zod pesa: se baja recién al enviar, no al abrir la página.
	const { processBooking } = await import('./process');
	return processBooking(values, { services, vehicleTypes, settings, getSlots: demoSlots });
}
