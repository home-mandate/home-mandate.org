import { implementData } from '#lib/implement/build-data.ts';
import { spec } from '#lib/generated/spec.ts';
import type { PageServerLoad } from './$types';

// Runs once per language while prerendering: everything is derived from the
// imported specification, nothing is typed in by hand.
export const load: PageServerLoad = () => implementData(process.cwd(), spec.latest.tag);
