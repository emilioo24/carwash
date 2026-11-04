// Estos tipos tienen la forma de las futuras tablas de Supabase (ver README).

export type ISODate = string; // 'YYYY-MM-DD'
export type TimeHHmm = string; // '11:00'

export type VehicleTypeId = string; // viene de la tabla vehicle_types

export interface VehicleType {
	id: VehicleTypeId;
	label: string; // 'Camioneta / SUV'
	shortLabel: string; // 'Camioneta'
	pluralLabel: string; // 'Camionetas'
	sortOrder: number;
}

export interface Service {
	id: string;
	vehicleTypeId: VehicleTypeId;
	name: string;
	description: string;
	priceArs: number; // pesos enteros
	isPopular: boolean;
	isActive: boolean;
	sortOrder: number;
}

export interface GalleryItem {
	id: string;
	title: string;
	vehicleType: VehicleTypeId;
	before: string | null;
	/** La foto de antes fue ensuciada por software: solo se muestra en la demo. */
	isSimulated?: boolean; // null = todavía no hay foto de "antes"
	after: string;
	isPublished: boolean;
	sortOrder: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
	id: string;
	customerName: string;
	customerPhone: string;
	vehicleTypeId: VehicleTypeId;
	serviceId: string;
	date: ISODate;
	time: TimeHHmm;
	priceArs: number; // copia del precio al reservar
	status: BookingStatus;
	createdAt: string;
}

export interface BlockedSlot {
	id: string;
	date: ISODate;
	time: TimeHHmm | null; // null = todo el día
	reason: string | null;
}

export interface TimeSlot {
	time: TimeHHmm;
	available: boolean; // el admin podrá mostrar turnos ocupados
}

export interface OpeningHours {
	weekday: number; // 0 = domingo
	open: TimeHHmm | null; // null = cerrado
	close: TimeHHmm | null;
	lastSlot: TimeHHmm | null;
}

export interface BusinessSettings {
	name: string;
	tagline: string;
	address: {
		street: string;
		area: string;
		city: string;
		region: string;
		countryCode: string;
		postalCode: string | null;
		mapsQuery: string;
	};
	whatsapp: { display: string; international: string };
	instagram: { handle: string; url: string };
	timezone: string;
	openingHours: OpeningHours[];
	slotMinutes: number;
	bookingWindowDays: number;
	heroImage: string;
	ogImage: string;
	featuredGalleryId: string;
}

/** Lo que devuelve el form action ?/reservar. */
export interface BookingFormState {
	success?: boolean;
	whatsappUrl?: string;
	summary?: string;
	errors?: Partial<Record<string, string[]>>;
	values?: Partial<Record<string, string>>;
}
