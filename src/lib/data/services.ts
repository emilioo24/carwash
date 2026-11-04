import type { Service } from '#lib/types';

export const services: Service[] = [
	{
		id: 'auto-exterior-aspirado',
		vehicleTypeId: 'auto',
		name: 'Lavado exterior + aspirado',
		description: 'Lavado exterior completo + aspirado interior',
		priceArs: 12000,
		isPopular: false,
		isActive: true,
		sortOrder: 1
	},
	{
		id: 'auto-completo',
		vehicleTypeId: 'auto',
		name: 'Lavado completo',
		description: 'Lavado completo exterior e interior con encerado',
		priceArs: 15000,
		isPopular: true, // TODO: confirmar "El más elegido"
		isActive: true,
		sortOrder: 2
	},
	{
		id: 'camioneta-exterior-aspirado',
		vehicleTypeId: 'camioneta',
		name: 'Lavado exterior + aspirado',
		description: 'Lavado exterior + aspirado',
		priceArs: 20000,
		isPopular: false,
		isActive: true,
		sortOrder: 3
	},
	{
		id: 'camioneta-completo',
		vehicleTypeId: 'camioneta',
		name: 'Lavado completo',
		description: 'Lavado completo exterior e interior',
		priceArs: 25000,
		isPopular: true, // TODO: confirmar "El más elegido"
		isActive: true,
		sortOrder: 4
	}
];
