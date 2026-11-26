// Build-time data of /implement/relay/: the downloads come from the files the
// site serves (.generated/static, written by scripts/import-relay.ts), the
// counts of cases from the manifest of the imported release.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { relay } from '#lib/generated/relay.ts';
import type { Download } from '#lib/implement/downloads.ts';

export const RELAY_DOWNLOADS = [
	{ id: 'metadata', path: 'relay-metadata/v0/metadata.schema.json', file: 'relay-metadata.schema.json' },
	{ id: 'enrollment', path: 'relay-enrollment/v0/enrollment.schema.json', file: 'relay-enrollment.schema.json' }
] as const;

export type RelayDownloadId = (typeof RELAY_DOWNLOADS)[number]['id'];

export interface RelayImplementData {
	downloads: Download<RelayDownloadId>[];
	/** All cases of the release and the number of files they are in. */
	cases: number;
	files: number;
}

export function relayImplementData(root = process.cwd()): RelayImplementData {
	const served = join(root, '.generated', 'static');
	const downloads = RELAY_DOWNLOADS.map(({ id, path, file }) => {
		const bytes = readFileSync(join(served, path));
		return { id, href: `/${path}`, file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
	});
	return { downloads, cases: relay.cases.reduce((sum, f) => sum + f.cases, 0), files: relay.cases.length };
}
