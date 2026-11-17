import type { Reroute } from '@sveltejs/kit/hooks';
import { deLocalizeUrl } from '#lib/paraglide/runtime.js';

// /de/imprint/ renders the route /imprint/ with locale de.
export const reroute: Reroute = (request) => deLocalizeUrl(request.url).pathname;
