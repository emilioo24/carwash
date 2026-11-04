import type { BusinessSettings, ISODate, TimeHHmm } from '#lib/types';
import { formatDateShort } from './date';

/** 15000 -> '$15.000' */
export function formatPrice(value: number): string {
	return `$${Math.round(value)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/** 'Auto · Lavado completo · Sáb 7/11 · 11:00 · $15.000' (acepta datos parciales) */
export function bookingSummary(parts: {
	vehicle?: string;
	service?: string;
	date?: ISODate;
	time?: TimeHHmm;
	price?: number;
}): string {
	return [
		parts.vehicle,
		parts.service,
		parts.date ? formatDateShort(parts.date) : undefined,
		parts.time,
		parts.price !== undefined ? formatPrice(parts.price) : undefined
	]
		.filter(Boolean)
		.join(' · ');
}

const DAYS = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];
const DAYS_RANGE_END = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const CHIP_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

/** Agrupa días consecutivos con el mismo horario, empezando por el lunes. */
function hourGroups(settings: BusinessSettings) {
	const ordered = [1, 2, 3, 4, 5, 6, 0].flatMap((weekday) => {
		const hours = settings.openingHours.find((h) => h.weekday === weekday);
		return hours ? [hours] : [];
	});

	const groups: { first: number; last: number; open: string | null; close: string | null }[] = [];
	for (const { weekday, open, close } of ordered) {
		const current = groups.at(-1);
		if (current && current.open === open && current.close === close) current.last = weekday;
		else groups.push({ first: weekday, last: weekday, open, close });
	}
	return groups;
}

/** [{ days: 'Lunes a sábado', hours: '10:00 a 17:00' }, { days: 'Domingos', hours: 'Cerrado' }] */
export function openingHoursText(settings: BusinessSettings) {
	return hourGroups(settings).map(({ first, last, open, close }) => ({
		days:
			first === last
				? capitalize(DAYS[first])
				: `${capitalize(DAYS_RANGE_END[first])} a ${DAYS_RANGE_END[last]}`,
		hours: open && close ? `${open} a ${close}` : 'Cerrado'
	}));
}

/** 'Lun a Sáb · 10 a 17 h' */
export function openingHoursChip(settings: BusinessSettings): string {
	const group = hourGroups(settings).find((g) => g.open && g.close);
	if (!group?.open || !group.close) return '';
	const hour = (time: string) => String(Number(time.split(':')[0]));
	return `${CHIP_DAYS[group.first]} a ${CHIP_DAYS[group.last]} · ${hour(group.open)} a ${hour(group.close)} h`;
}
