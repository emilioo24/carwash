import type { BusinessSettings, OpeningHours } from '#lib/types';

const workday = (weekday: number): OpeningHours => ({
	weekday,
	open: '10:00',
	close: '17:00',
	lastSlot: '17:00' // TODO: confirmar si se toman autos a las 17:00, hora de cierre
});

export const settings: BusinessSettings = {
	name: 'Cars Wash',
	tagline: 'Lavado de autos premium · Tu auto limpio y reluciente',
	address: {
		// TODO: confirmar dirección exacta. Instagram: "Pasaje Fernández 962";
		// web actual: "Coronel Néstor Fernández 962".
		street: 'Pasaje Cnel. Néstor Fernández 962',
		area: 'Zona Norte',
		city: 'Rosario',
		region: 'Santa Fe',
		countryCode: 'AR',
		postalCode: null, // TODO: código postal
		mapsQuery: 'Pasaje Néstor Fernández 962, Rosario'
	},
	whatsapp: { display: '341 579-3719', international: '5493415793719' },
	instagram: { handle: 'carswash.znr', url: 'https://www.instagram.com/carswash.znr/' },
	timezone: 'America/Argentina/Cordoba',
	openingHours: [
		{ weekday: 0, open: null, close: null, lastSlot: null },
		...[1, 2, 3, 4, 5, 6].map(workday)
	],
	slotMinutes: 60,
	bookingWindowDays: 60, // TODO: confirmar con cuánta anticipación se puede reservar
	heroImage: '/img/trabajos/autos/scirocco-tres-cuartos-despues.webp',
	ogImage: '/img/og.jpg',
	featuredGalleryId: 'scirocco-lateral'
};
