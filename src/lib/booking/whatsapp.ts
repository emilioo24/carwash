import { formatDateLong } from '#lib/utils/date';
import { formatPrice } from '#lib/utils/format';
import type { ISODate, TimeHHmm } from '#lib/types';

const CLOCKS: Record<number, string> = {
	10: '🕙',
	11: '🕚',
	12: '🕛',
	13: '🕐',
	14: '🕑',
	15: '🕒',
	16: '🕓',
	17: '🕔'
};

export interface WhatsAppBooking {
	businessName: string;
	businessPhone: string;
	vehicle: string;
	service: string;
	priceArs: number;
	date: ISODate;
	time: TimeHHmm;
	fullName: string;
	phone: string;
}

export function buildBookingMessage(booking: WhatsAppBooking): string {
	const clock = CLOCKS[Number(booking.time.split(':')[0])] ?? '🕒';
	return [
		`¡Hola ${booking.businessName}! 👋 Quiero reservar un turno:`,
		`🚗 Vehículo: ${booking.vehicle}`,
		`🧼 Servicio: ${booking.service} (${formatPrice(booking.priceArs)})`,
		`📅 ${formatDateLong(booking.date)}`,
		`${clock} ${booking.time}`,
		`👤 ${booking.fullName}`,
		`📞 ${booking.phone}`
	].join('\n');
}

export function buildWhatsAppUrl(booking: WhatsAppBooking): string {
	return `https://wa.me/${booking.businessPhone}?text=${encodeURIComponent(buildBookingMessage(booking))}`;
}
