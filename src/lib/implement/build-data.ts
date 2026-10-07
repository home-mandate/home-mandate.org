// Build-time data of /implement/ (server only: reads files). The schema and the
// downloads come from the files the site serves (.generated/static, written by
// scripts/import-spec.ts), the case counts from the imported release itself.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CASE_FILES, caseCounts, type CaseFiles } from './conformance';
import { dataModel, type DataModel } from './model';
import { DOWNLOADS, type Download } from './downloads';

export interface ImplementData {
	model: DataModel;
	counts: ReturnType<typeof caseCounts>;
	downloads: Download[];
	/** Number of device categories in the vocabulary. */
	categories: number;
}

function json(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

/**
 * @param root  the project directory
 * @param tag   the imported release, e.g. v0.2.0-alpha.4
 */
export function implementData(root: string, tag: string): ImplementData {
	const served = join(root, '.generated', 'static');
	const release = join(root, '.spec-cache', tag);

	const downloads = DOWNLOADS.map(({ id, path, file }) => {
		const bytes = readFileSync(join(served, path));
		return { id, href: `/${path}`, file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
	});

	const files = Object.fromEntries(CASE_FILES.map((name) => [name, json(join(release, 'conformance', `${name}-v0.json`))])) as CaseFiles;
	const vocabulary = json(join(served, 'vocabulary', 'v0.json'));
	const categories = vocabulary.categories;
	if (typeof categories !== 'object' || categories === null) throw new Error('vocabulary/v0.json has no categories');

	return {
		model: dataModel(json(join(served, 'mandate', 'v0', 'mandate.schema.json'))),
		counts: caseCounts(files),
		downloads,
		categories: Object.keys(categories).length
	};
}
