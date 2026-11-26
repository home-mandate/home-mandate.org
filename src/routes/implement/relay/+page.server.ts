import { relayImplementData } from '#lib/relay/build-data.server.ts';
import type { PageServerLoad } from './$types';

// Runs once per language while prerendering: everything is derived from the
// imported Relay Specification.
export const load: PageServerLoad = () => relayImplementData();
