// Reads the imported releases of the specification at build time:
// .spec-cache/<tag>/SPEC-v0.md (checked out and verified by
// scripts/import-spec.ts) and the date of the release tag from git.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spec } from '$lib/generated/spec';
import { parseSpec } from './markdown';
import type { LoadedSpec, SpecVersion } from './types';

export const SPEC_FILE = 'SPEC-v0.md';
const TAG = /^v0\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$/;

/** The imported v0 releases, newest first (spec.lock.json lists them oldest first). */
export function specVersions(versions: readonly { tag: string }[] = spec.versions, latest: string = spec.latest.tag): SpecVersion[] {
	return versions
		.filter((v) => TAG.test(v.tag))
		.map((v) => ({ tag: v.tag, latest: v.tag === latest }))
		.reverse();
}

/** Date of a release tag from the checkout in .spec-cache, or undefined. */
export function tagDate(tag: string, root = process.cwd()): string | undefined {
	if (!TAG.test(tag)) return undefined;
	try {
		const out = execFileSync('git', ['for-each-ref', `refs/tags/${tag}`, '--format=%(creatordate:short)'], {
			cwd: join(root, '.spec-cache', tag),
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore']
		}).trim();
		return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
	} catch {
		return undefined;
	}
}

const cache = new Map<string, LoadedSpec>();

/** The parsed specification of an imported release. */
export function loadSpec(tag: string, root = process.cwd()): LoadedSpec {
	if (!TAG.test(tag)) throw new Error(`not a v0 release tag: ${tag}`);
	const key = `${root}\0${tag}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const markdown = readFileSync(join(root, '.spec-cache', tag, SPEC_FILE), 'utf8');
	const document = parseSpec(markdown, { repository: spec.repository, tag, file: SPEC_FILE });
	const date = tagDate(tag, root);
	const loaded: LoadedSpec = date ? { tag, date, document } : { tag, document };
	cache.set(key, loaded);
	return loaded;
}
