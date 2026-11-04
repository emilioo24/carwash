import { blockedSlots } from '#lib/data/blocked-slots';
import { computeBookableDates, computeSlots } from '#lib/utils/availability';
import { localDate } from '#lib/utils/date';
import { getSettings } from './settings';
import type { ISODate, TimeSlot } from '#lib/types';

export async function getAvailableSlots(date: ISODate, now = new Date()): Promise<TimeSlot[]> {
	// TODO(admin): excluir también los turnos ya reservados en Supabase
	return computeSlots(await getSettings(), blockedSlots, date, now);
}

export async function getBookableDates(now = new Date()): Promise<ISODate[]> {
	return computeBookableDates(await getSettings(), blockedSlots, now);
}

export async function getToday(now = new Date()): Promise<ISODate> {
	const { timezone } = await getSettings();
	return localDate(now, timezone);
}
