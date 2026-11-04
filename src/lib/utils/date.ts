import type { ISODate, TimeHHmm } from '#lib/types';

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre'
];

const toUTC = (date: ISODate) => new Date(`${date}T12:00:00Z`);
const pad = (value: number) => String(value).padStart(2, '0');

export function localDate(now: Date, timezone: string): ISODate {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

export function localTime(now: Date, timezone: string): TimeHHmm {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: timezone,
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).format(now);
}

export function weekdayOf(date: ISODate): number {
	return toUTC(date).getUTCDay();
}

export function addDays(date: ISODate, days: number): ISODate {
	const result = toUTC(date);
	result.setUTCDate(result.getUTCDate() + days);
	return result.toISOString().slice(0, 10);
}

export function isValidISODate(date: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
	const parsed = toUTC(date);
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

const toMinutes = (time: TimeHHmm) => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
};

/** Horarios desde `first` hasta `last`, ambos incluidos. */
export function buildSlots(first: TimeHHmm, last: TimeHHmm, stepMinutes: number): TimeHHmm[] {
	const slots: TimeHHmm[] = [];
	for (let minute = toMinutes(first); minute <= toMinutes(last); minute += stepMinutes) {
		slots.push(`${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`);
	}
	return slots;
}

const dayAndMonth = (date: ISODate) => {
	const [, month, day] = date.split('-').map(Number);
	return `${day}/${month}`;
};

/** 'Sáb 7/11' */
export function formatDateShort(date: ISODate): string {
	return `${WEEKDAYS_SHORT[weekdayOf(date)]} ${dayAndMonth(date)}`;
}

/** 'Sábado 7/11' */
export function formatDateLong(date: ISODate): string {
	return `${WEEKDAYS[weekdayOf(date)]} ${dayAndMonth(date)}`;
}

/** 'sábado 7 de noviembre' */
export function formatDateSpoken(date: ISODate): string {
	const [, month, day] = date.split('-').map(Number);
	return `${WEEKDAYS[weekdayOf(date)].toLowerCase()} ${day} de ${MONTHS[month - 1]}`;
}
