import { gallery } from '#lib/data/gallery';

export async function getGallery() {
	return gallery
		.filter((item) => item.isPublished)
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((item) =>
			// Las fotos sucias simuladas se ven en la demo y en desarrollo, nunca en producción.
			item.isSimulated && !__SHOW_SIMULATED__ ? { ...item, before: null, isSimulated: false } : item
		);
}
