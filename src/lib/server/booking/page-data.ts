import {
	getBookableDates,
	getServices,
	getSettings,
	getToday,
	getVehicleTypes
} from '#lib/server/repositories';
import { buildSlots } from '#lib/utils/date';

/** Lo que necesita el formulario de /reservar. */
export async function loadBookingData() {
	const [services, vehicleTypes, bookableDates, today, settings] = await Promise.all([
		getServices(),
		getVehicleTypes(),
		getBookableDates(),
		getToday(),
		getSettings()
	]);

	// Solo para el <select> sin JS: el servidor vuelve a validar el horario elegido.
	const open = settings.openingHours.find((hours) => hours.open && hours.lastSlot);
	const fallbackHours =
		open?.open && open.lastSlot ? buildSlots(open.open, open.lastSlot, settings.slotMinutes) : [];

	return { services, vehicleTypes, bookableDates, today, fallbackHours };
}
