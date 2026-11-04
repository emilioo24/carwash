import { addDays, buildSlots, localDate, localTime, weekdayOf } from './date';
import type { BlockedSlot, BusinessSettings, ISODate, TimeSlot } from '#lib/types';

type Schedule = Pick<BusinessSettings, 'timezone' | 'openingHours' | 'slotMinutes' | 'bookingWindowDays'>;

/** Reglas de horarios, sin acceso a datos: las usan el servidor y la demo estática. */
export function computeSlots(
	settings: Schedule,
	blockedSlots: BlockedSlot[],
	date: ISODate,
	now: Date
): TimeSlot[] {
	const { timezone, openingHours, slotMinutes, bookingWindowDays } = settings;
	const today = localDate(now, timezone); // Cloudflare corre en UTC: siempre hora de Rosario

	if (date < today || date > addDays(today, bookingWindowDays)) return [];

	const hours = openingHours.find((h) => h.weekday === weekdayOf(date));
	if (!hours?.open || !hours.lastSlot) return [];

	const blocks = blockedSlots.filter((b) => b.date === date);
	if (blocks.some((b) => b.time === null)) return [];

	const currentTime = date === today ? localTime(now, timezone) : null;

	return buildSlots(hours.open, hours.lastSlot, slotMinutes)
		.filter((time) => !currentTime || time > currentTime)
		.filter((time) => !blocks.some((b) => b.time === time))
		.map((time) => ({ time, available: true }));
}

/** Días que el calendario muestra habilitados. */
export function computeBookableDates(
	settings: Schedule,
	blockedSlots: BlockedSlot[],
	now: Date
): ISODate[] {
	const today = localDate(now, settings.timezone);
	return Array.from({ length: settings.bookingWindowDays + 1 }, (_, i) => addDays(today, i)).filter(
		(day) => computeSlots(settings, blockedSlots, day, now).length > 0
	);
}
