import { loadRelayReleaseNotes } from '#lib/relay/source.server.ts';
import type { PageServerLoad } from './$types';

// Read from the "Changelog" section of the imported Relay Specification at build time.
export const load: PageServerLoad = () => ({ notes: loadRelayReleaseNotes() });
