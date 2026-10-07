// The example mandates of the specification, read at build time from the imported
// release (.spec-cache/<tag>/examples/), exactly as published.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EXAMPLE_FILES } from '../../client/playground/examples.ts';
import { spec } from '$lib/generated/spec';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const dir = join(process.cwd(), '.spec-cache', spec.latest.tag, 'examples');
	const examples = Object.fromEntries(
		Object.entries(EXAMPLE_FILES).map(([id, file]) => [id, readFileSync(join(dir, `${file}.json`), 'utf8')])
	) as Record<keyof typeof EXAMPLE_FILES, string>;
	return { examples, version: spec.latest.tag };
};
