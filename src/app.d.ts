declare global {
	/** true solo en `pnpm build:demo` (GitHub Pages, sin servidor). */
	const __STATIC_DEMO__: boolean;
	/** true en la demo y en `pnpm dev`. El build de Cloudflare no muestra fotos simuladas. */
	const __SHOW_SIMULATED__: boolean;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
