import { describe, expect, it } from 'vitest';
import { bookingSchema } from '#lib/schemas/booking';
import { buildBookingMessage, buildWhatsAppUrl } from '#lib/booking/whatsapp';
import { getAvailableSlots, getBookableDates, getGallery } from '#lib/server/repositories';
import { formatDateShort } from '#lib/utils/date';
import { bookingSummary, formatPrice } from '#lib/utils/format';

// 2026-11-04 12:30 UTC son las 09:30 en Rosario (UTC-3).
const at = (iso: string) => new Date(iso);
const times = async (date: string, now: Date) => (await getAvailableSlots(date, now)).map((s) => s.time);

describe('getAvailableSlots', () => {
	const beforeOpening = at('2026-11-04T12:30:00Z');

	it('ofrece turnos de 10:00 a 17:00, uno por hora', async () => {
		expect(await times('2026-11-07', beforeOpening)).toEqual([
			'10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
		]);
	});

	it('no ofrece turnos los domingos', async () => {
		expect(await times('2026-11-08', beforeOpening)).toEqual([]);
	});

	it('no ofrece turnos en fechas pasadas', async () => {
		expect(await times('2026-11-03', beforeOpening)).toEqual([]);
	});

	it('si es hoy, esconde las horas que ya pasaron', async () => {
		const midday = at('2026-11-04T16:30:00Z'); // 13:30 en Rosario
		expect(await times('2026-11-04', midday)).toEqual(['14:00', '15:00', '16:00', '17:00']);
	});

	it('usa la hora de Rosario aunque en UTC ya sea otro día', async () => {
		const lateNight = at('2026-11-05T01:00:00Z'); // miércoles 22:00 en Rosario
		expect(await times('2026-11-04', lateNight)).toEqual([]);
		expect((await times('2026-11-05', lateNight)).length).toBe(8);
	});

	it('el calendario no habilita domingos', async () => {
		const dates = await getBookableDates(beforeOpening);
		expect(dates).not.toContain('2026-11-08');
		expect(dates).toContain('2026-11-07');
		expect(dates).not.toContain('2026-11-03');
	});
});

describe('mensaje de WhatsApp', () => {
	const booking = {
		businessName: 'Cars Wash',
		businessPhone: '5493415793719',
		vehicle: 'Auto',
		service: 'Lavado completo',
		priceArs: 15000,
		date: '2026-11-07',
		time: '11:00',
		fullName: 'Juan Pérez',
		phone: '341 555-1234'
	};

	it('arma el mensaje completo', () => {
		expect(buildBookingMessage(booking)).toBe(
			[
				'¡Hola Cars Wash! 👋 Quiero reservar un turno:',
				'🚗 Vehículo: Auto',
				'🧼 Servicio: Lavado completo ($15.000)',
				'📅 Sábado 7/11',
				'🕚 11:00',
				'👤 Juan Pérez',
				'📞 341 555-1234'
			].join('\n')
		);
	});

	it('apunta al número del negocio y codifica el texto', () => {
		const url = new URL(buildWhatsAppUrl(booking));
		expect(url.origin + url.pathname).toBe('https://wa.me/5493415793719');
		expect(url.searchParams.get('text')).toBe(buildBookingMessage(booking));
	});
});

describe('validación', () => {
	const valid = {
		fullName: 'Juan Pérez',
		phone: '341 555-1234',
		vehicleTypeId: 'auto',
		serviceId: 'auto-completo',
		date: '2026-11-07',
		time: '11:00'
	};

	it('acepta una reserva correcta', () => {
		expect(bookingSchema.safeParse(valid).success).toBe(true);
	});

	it.each([
		['fullName', 'J'],
		['phone', '123'],
		['phone', 'llamame'],
		['date', '2026-02-31'],
		['time', 'mediodía']
	])('rechaza %s = %s', (field, value) => {
		expect(bookingSchema.safeParse({ ...valid, [field]: value }).success).toBe(false);
	});
});

describe('formatos', () => {
	it('precios y resumen', () => {
		expect(formatPrice(15000)).toBe('$15.000');
		expect(formatDateShort('2026-11-07')).toBe('Sáb 7/11');
		expect(
			bookingSummary({
				vehicle: 'Auto',
				service: 'Lavado completo',
				date: '2026-11-07',
				time: '11:00',
				price: 15000
			})
		).toBe('Auto · Lavado completo · Sáb 7/11 · 11:00 · $15.000');
	});
});

describe('fotos simuladas', () => {
	it('no llegan a producción', async () => {
		const gallery = await getGallery();
		expect(gallery.some((item) => item.isSimulated)).toBe(false);
		expect(gallery.some((item) => item.before?.includes('simulado'))).toBe(false);
	});
});
