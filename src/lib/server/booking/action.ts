import { fail, type RequestEvent } from '@sveltejs/kit';
import { processBooking } from '#lib/booking/process';
import {
	getAvailableSlots,
	getServices,
	getSettings,
	getVehicleTypes
} from '#lib/server/repositories';

/** Form action de /reservar. */
export async function reservarAction({ request }: RequestEvent) {
	const formData = await request.formData();
	const values = Object.fromEntries(
		[...formData.entries()].map(([key, value]) => [key, String(value)])
	);

	const [services, vehicleTypes, settings] = await Promise.all([
		getServices(),
		getVehicleTypes(),
		getSettings()
	]);
	const result = await processBooking(values, {
		services,
		vehicleTypes,
		settings,
		getSlots: (date) => getAvailableSlots(date)
	});

	if (!result.ok) return fail(400, { errors: result.errors, values });

	// TODO(admin): guardar en Supabase (tabla bookings, con status 'pending' y copia de priceArs)
	// y avisar por WhatsApp. Hoy el turno solo viaja en el mensaje.

	return { success: true, whatsappUrl: result.whatsappUrl, summary: result.summary };
}
