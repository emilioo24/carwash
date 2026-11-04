import { z } from 'zod';
import { isValidISODate } from '#lib/utils/date';

export const bookingSchema = z.object({
	fullName: z
		.string({ error: 'Ingresá tu nombre completo.' })
		.trim()
		.min(3, 'Ingresá tu nombre completo.')
		.max(80, 'El nombre no puede superar los 80 caracteres.'),
	phone: z
		.string({ error: 'Ingresá tu teléfono.' })
		.trim()
		.min(1, 'Ingresá tu teléfono.')
		.regex(/^[+\d\s()-]+$/, 'El teléfono solo puede tener números, espacios y guiones.')
		.refine((value) => {
			const digits = value.replace(/\D/g, '').length;
			return digits >= 8 && digits <= 15;
		}, 'Revisá el teléfono: tiene que tener entre 8 y 15 números.'),
	vehicleTypeId: z.string({ error: 'Elegí un vehículo.' }).min(1, 'Elegí un vehículo.'),
	serviceId: z.string({ error: 'Elegí un servicio.' }).min(1, 'Elegí un servicio.'),
	date: z
		.string({ error: 'Elegí una fecha.' })
		.min(1, 'Elegí una fecha.')
		.refine(isValidISODate, 'La fecha no es válida. Elegí otra.'),
	time: z
		.string({ error: 'Elegí un horario.' })
		.min(1, 'Elegí un horario.')
		.regex(/^\d{2}:\d{2}$/, 'Elegí un horario de la lista.')
});

export type BookingInput = z.infer<typeof bookingSchema>;
