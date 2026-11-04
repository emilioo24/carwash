import type { BusinessSettings, Service, VehicleType } from '#lib/types';
import { formatPrice } from './format';

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function autoWashJsonLd(
	settings: BusinessSettings,
	services: Service[],
	vehicleTypes: VehicleType[],
	origin: string
): string {
	const prices = services.map((service) => service.priceArs);
	const vehicleLabel = (id: string) => vehicleTypes.find((v) => v.id === id)?.label ?? id;
	const { address } = settings;

	const data = {
		'@context': 'https://schema.org',
		'@type': 'AutoWash',
		name: settings.name,
		description: settings.tagline,
		url: origin,
		logo: `${origin}/img/logo.png`,
		image: `${origin}${settings.ogImage}`,
		telephone: `+${settings.whatsapp.international}`,
		sameAs: [settings.instagram.url],
		priceRange: `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`,
		currenciesAccepted: 'ARS',
		address: {
			'@type': 'PostalAddress',
			streetAddress: address.street,
			addressLocality: address.city,
			addressRegion: address.region,
			addressCountry: address.countryCode,
			...(address.postalCode ? { postalCode: address.postalCode } : {})
		},
		openingHoursSpecification: settings.openingHours.flatMap((hours) =>
			hours.open && hours.close
				? [
						{
							'@type': 'OpeningHoursSpecification',
							dayOfWeek: SCHEMA_DAYS[hours.weekday],
							opens: hours.open,
							closes: hours.close
						}
					]
				: []
		),
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Servicios de lavado',
			itemListElement: services.map((service) => ({
				'@type': 'Offer',
				price: service.priceArs,
				priceCurrency: 'ARS',
				itemOffered: {
					'@type': 'Service',
					name: `${service.name} (${vehicleLabel(service.vehicleTypeId)})`,
					description: service.description
				}
			}))
		}
	};

	return JSON.stringify(data).replace(/</g, '\\u003c');
}
