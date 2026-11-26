// Reads the imported releases of the Relay Specification at build time:
// .spec-cache/relay/<tag>/RELAY-v0.md (checked out and verified by
// scripts/import-relay.ts) and the date of the release tag from git.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { relay } from '#lib/generated/relay.ts';
import { parseSpec } from '#lib/spec/markdown.ts';
import { plainText } from '#lib/spec/inline.ts';
import { releaseNotes } from '#lib/spec/release-notes.server.ts';
import type { ReleaseNotes } from '#lib/spec/changelog.ts';
import { specVersions, tagDate } from '#lib/spec/source.server.ts';
import type { Block, LoadedSpec, SpecVersion } from '#lib/spec/types.ts';
import { linkToText, type RelayErrorView } from './errors';

export const RELAY_FILE = 'RELAY-v0.md';
const CACHE = join('.spec-cache', 'relay');
const TAG = /^v0\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$/;

/** The imported v0 releases of the Relay Specification, newest first. */
export function relayVersions(): SpecVersion[] {
	return specVersions(relay.versions, relay.latest.tag);
}

const loaded = new Map<string, LoadedSpec>();

/** The parsed Relay Specification of an imported release. */
export function loadRelay(tag: string, root = process.cwd()): LoadedSpec {
	if (!TAG.test(tag)) throw new Error(`not a v0 release tag of the Relay Specification: ${tag}`);
	const key = `${root}\0${tag}`;
	const hit = loaded.get(key);
	if (hit) return hit;
	const markdown = readFileSync(join(root, CACHE, tag, RELAY_FILE), 'utf8');
	const document = parseSpec(markdown, { repository: relay.repository, tag, file: RELAY_FILE });
	const date = tagDate(tag, root, CACHE);
	const result: LoadedSpec = date ? { tag, date, document } : { tag, document };
	loaded.set(key, result);
	return result;
}


const NAME = /^[a-z][a-z0-9-]*$/;

/**
 * The errors of the enrollment API (Section 5.1): the table whose header is
 * Error | Status | Meaning | Gateway. Its rows are the only problem types of
 * https://home-mandate.org/relay/errors/; a missing or changed table stops the build.
 */
export function relayErrors(blocks: Block[]): RelayErrorView[] {
	const table = blocks.find((b) => b.type === 'table' && b.header.map((c) => plainText(c)).join('|') === 'Error|Status|Meaning|Gateway');
	if (!table || table.type !== 'table') throw new Error(`${RELAY_FILE}: the table of errors (Section 5.1) is missing`);
	return table.rows.map((row) => {
		const [name, status] = row.map((c) => plainText(c));
		if (!name || !NAME.test(name) || !/^[0-9]{3}$/.test(status ?? '')) throw new Error(`${RELAY_FILE}: unexpected row in the table of errors: ${name} ${status}`);
		return { name, status: Number(status), meaning: linkToText(row[2] ?? []), gateway: linkToText(row[3] ?? []) };
	});
}

/** The changelog of the latest imported release of the Relay Specification. */
export function loadRelayReleaseNotes(root = process.cwd()): ReleaseNotes {
	return releaseNotes(loadRelay(relay.latest.tag, root), relayVersions(), root, CACHE);
}
