import { getGallery, getServices, getVehicleTypes } from '#lib/server/repositories';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const [services, vehicleTypes, gallery] = await Promise.all([
		getServices(),
		getVehicleTypes(),
		getGallery()
	]);
	// Un sitio estático no ve la query al compilar: en la demo la lee el navegador.
	const requested = __STATIC_DEMO__ ? null : url.searchParams.get('vehiculo');
	const initialVehicle =
		vehicleTypes.find((type) => type.id === requested)?.id ?? vehicleTypes[0]?.id ?? '';

	return { services, vehicleTypes, gallery, initialVehicle };
};
