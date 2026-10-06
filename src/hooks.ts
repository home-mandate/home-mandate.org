import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

// /de/imprint/ renders the route /imprint/ with locale de.
export const reroute: Reroute = (request) => deLocalizeUrl(request.url).pathname;
