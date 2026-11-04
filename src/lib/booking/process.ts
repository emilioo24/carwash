import { z } from 'zod';
import { bookingSchema } from '#lib/schemas/booking';
import { bookingSummary } from '#lib/utils/format';
import type { BusinessSettings, ISODate, Service, TimeSlot, VehicleType } from '#lib/types';
import { buildWhatsAppUrl } from './whatsapp';

export interface BookingContext {
	services: Service[];
	vehicleTypes: VehicleType[];
	settings: BusinessSettings;
	getSlots: (date: ISODate) => TimeSlot[] | Promise<TimeSlot[]>;
}

export type BookingResult =
	| { ok: true; whatsappUrl: string; summary: string }
	| { ok: false; errors: Record<string, string[] | undefined> };

/** Valida una reserva y arma el mensaje. Corre en el servidor y en la demo estática. */
export async function processBooking(
	values: Record<string, string>,
	{ services, vehicleTypes, settings, getSlots }: BookingContext
): Promise<BookingResult> {
	const parsed = bookingSchema.safeParse(values);
	if (!parsed.success) {
		return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
	}
	const booking = parsed.data;

	const vehicle = vehicleTypes.find((v) => v.id === booking.vehicleTypeId);
	if (!vehicle) {
		return { ok: false, errors: { vehicleTypeId: ['Elegí un vehículo.'] } };
	}

	const service = services.find((s) => s.id === booking.serviceId);
	if (!service || service.vehicleTypeId !== vehicle.id) {
		return {
			ok: false,
			errors: {
				serviceId: [`Elegí un servicio disponible para ${vehicle.shortLabel.toLowerCase()}.`]
			}
		};
	}

	const slots = await getSlots(booking.date);
	if (slots.length === 0) {
		return {
			ok: false,
			errors: { date: ['Ese día no hay turnos: puede estar cerrado o ya pasó. Elegí otra fecha.'] }
		};
	}
	if (!slots.some((slot) => slot.time === booking.time && slot.available)) {
		return { ok: false, errors: { time: ['Ese horario ya no está disponible. Elegí otro.'] } };
	}

	return {
		ok: true,
		whatsappUrl: buildWhatsAppUrl({
			businessName: settings.name,
			businessPhone: settings.whatsapp.international,
			vehicle: vehicle.shortLabel,
			service: service.name,
			priceArs: service.priceArs,
			date: booking.date,
			time: booking.time,
			fullName: booking.fullName,
			phone: booking.phone
		}),
		summary: bookingSummary({
			vehicle: vehicle.shortLabel,
			service: service.name,
			date: booking.date,
			time: booking.time,
			price: service.priceArs
		})
	};
}
