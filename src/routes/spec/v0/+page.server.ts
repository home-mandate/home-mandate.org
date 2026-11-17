import { spec } from '#lib/generated/spec.ts';
import { loadSpec, SPEC_FILE, specVersions } from '#lib/spec/source.server.ts';
import type { PageServerLoad } from './$types';

// The latest imported release, read and parsed at build time.
export const load: PageServerLoad = () => ({
	spec: loadSpec(spec.latest.tag),
	versions: specVersions(),
	file: SPEC_FILE
});
