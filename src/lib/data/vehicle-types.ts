import type { VehicleType } from '#lib/types';

export const vehicleTypes: VehicleType[] = [
	{ id: 'auto', label: 'Auto', shortLabel: 'Auto', pluralLabel: 'Autos', sortOrder: 1 },
	{
		id: 'camioneta',
		label: 'Camioneta / SUV',
		shortLabel: 'Camioneta',
		pluralLabel: 'Camionetas',
		sortOrder: 2
	}
];
