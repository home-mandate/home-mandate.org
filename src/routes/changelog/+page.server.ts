import { loadReleaseNotes } from '#lib/spec/release-notes.server.ts';
import type { PageServerLoad } from './$types';

// Read from the "Changelog" section of the imported specification at build time.
export const load: PageServerLoad = () => ({ notes: loadReleaseNotes() });
