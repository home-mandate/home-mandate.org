// The changelog of the latest imported release, with dates where they are
// known: the date of a release tag that was imported. Nothing else is dated.
import { spec } from '#lib/generated/spec.ts';
import { hasChanges, parseChangelog, type DatedEntry, type ReleaseNotes } from './changelog';
import { loadSpec, specVersions, tagDate } from './source.server';
import type { LoadedSpec, SpecVersion } from './types';

export function loadReleaseNotes(tag: string = spec.latest.tag, root = process.cwd()): ReleaseNotes {
	return releaseNotes(loadSpec(tag, root), specVersions(), root, '.spec-cache');
}

/** The changelog of a loaded document; entries of imported releases get the date of their tag. */
export function releaseNotes(loaded: LoadedSpec, versions: SpecVersion[], root: string, cacheDir: string): ReleaseNotes {
	const tag = loaded.tag;
	const imported = new Set(versions.map((v) => v.tag));
	// An "Unreleased" entry without a change ("Nothing yet.") is not shown.
	const entries = parseChangelog(loaded.document.blocks)
		.filter((entry) => !entry.unreleased || hasChanges(entry))
		.map((entry): DatedEntry => {
			const date = imported.has(entry.version) ? tagDate(entry.version, root, cacheDir) : undefined;
			return date ? { ...entry, date } : entry;
		});
	return loaded.date ? { tag, date: loaded.date, entries } : { tag, entries };
}
