import { services } from '#lib/data/services';
import { vehicleTypes } from '#lib/data/vehicle-types';
import type { VehicleTypeId } from '#lib/types';

export async function getVehicleTypes() {
	return [...vehicleTypes].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getServices(vehicleTypeId?: VehicleTypeId) {
	return services
		.filter((s) => s.isActive && (!vehicleTypeId || s.vehicleTypeId === vehicleTypeId))
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getServiceById(id: string) {
	return services.find((s) => s.id === id && s.isActive) ?? null;
}
