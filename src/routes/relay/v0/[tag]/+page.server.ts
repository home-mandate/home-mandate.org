import { error } from '@sveltejs/kit';
import { loadRelay, RELAY_FILE, relayVersions } from '#lib/relay/source.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// A permanent address for every imported release: /relay/v0/<tag>/. The latest
// one is also /relay/v0/.
export const entries: EntryGenerator = () => relayVersions().map((v) => ({ tag: v.tag }));

export const load: PageServerLoad = ({ params }) => {
	const versions = relayVersions();
	const version = versions.find((v) => v.tag === params.tag);
	if (!version) error(404, 'Unknown version');
	return { spec: loadRelay(version.tag), versions, file: RELAY_FILE, latest: version.latest };
};
