import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { languages } from '$lib/generated/languages';

// Locale per request in AsyncLocalStorage: safe while prerendering in parallel.
export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		const dir = languages.find((l) => l.tag === locale)?.dir ?? 'ltr';
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', dir)
		});
	});
