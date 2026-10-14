// Build-time data of /implement/ (server only: reads files). The schema and the
// downloads come from the files the site serves (.generated/static, written by
// scripts/import-spec.ts), the case counts from the imported release itself.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CASE_FILES, caseCounts, type CaseFiles } from './conformance';
import { dataModel, type DataModel } from './model';
import { DOWNLOADS, type Download } from './downloads';
import { spec } from '../generated/spec';
import { parseSpec } from '../spec/markdown';
import type { LinkContext } from '../spec/types';

export interface ImplementData {
	model: DataModel;
	counts: ReturnType<typeof caseCounts>;
	downloads: Download[];
	/** Number of device categories in the vocabulary. */
	categories: number;
	/** Anchor of section 1.1 (overview) in the imported release, or null if it has none. */
	overviewAnchor: string | null;
}

function json(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

/** Anchor of section 1.1 of the specification text, or null for a release without it. */
export function overviewAnchor(markdown: string, ctx: LinkContext): string | null {
	return parseSpec(markdown, ctx).toc.find((entry) => entry.number === '1.1')?.id ?? null;
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
		categories: Object.keys(categories).length,
		overviewAnchor: overviewAnchor(readFileSync(join(release, 'SPEC-v0.md'), 'utf8'), { repository: spec.repository, tag, file: 'SPEC-v0.md' })
	};
}
