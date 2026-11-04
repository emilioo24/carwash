import { error, json } from '@sveltejs/kit';
import { getAvailableSlots } from '#lib/server/repositories';
import { isValidISODate } from '#lib/utils/date';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date') ?? '';
	if (!isValidISODate(date)) error(400, 'Fecha no válida');

	return json(
		{ slots: await getAvailableSlots(date) },
		{ headers: { 'cache-control': 'no-store' } }
	);
};
