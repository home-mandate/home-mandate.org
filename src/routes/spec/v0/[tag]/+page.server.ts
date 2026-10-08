import { error } from '@sveltejs/kit';
import { loadSpec, SPEC_FILE, specVersions } from '$lib/spec/source.server';
import type { EntryGenerator, PageServerLoad } from './$types';

// A permanent address for every imported release: /spec/v0/<tag>/. Older
// releases are only reachable here; the latest one is also /spec/v0/.
export const entries: EntryGenerator = () => specVersions().map((v) => ({ tag: v.tag }));

export const load: PageServerLoad = ({ params }) => {
	const versions = specVersions();
	const version = versions.find((v) => v.tag === params.tag);
	if (!version) error(404, 'Unknown version');
	return { spec: loadSpec(version.tag), versions, file: SPEC_FILE, latest: version.latest };
};
