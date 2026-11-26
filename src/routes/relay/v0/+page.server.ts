import { relay } from '#lib/generated/relay.ts';
import { loadRelay, RELAY_FILE, relayVersions } from '#lib/relay/source.server.ts';
import type { PageServerLoad } from './$types';

// The latest imported release of the Relay Specification, read and parsed at build time.
export const load: PageServerLoad = () => ({
	spec: loadRelay(relay.latest.tag),
	versions: relayVersions(),
	file: RELAY_FILE
});
