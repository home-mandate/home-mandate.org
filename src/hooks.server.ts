import type { Handle } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { languages } from '#lib/generated/languages.ts';
import { externalLinksInNewTab } from '#lib/links.ts';

// Locale per request in AsyncLocalStorage: safe while prerendering in parallel.
// The reroute hook (src/hooks.ts) already maps /de/… to its route, and no load
// function reads the request, so the delocalized request is not needed.
export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ locale }) => {
		const dir = languages.find((l) => l.tag === locale)?.dir ?? 'ltr';
		return resolve(event, {
			transformPageChunk: ({ html }) => externalLinksInNewTab(html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', dir))
		});
	});
