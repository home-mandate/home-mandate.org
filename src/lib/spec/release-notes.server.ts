// The changelog of the latest imported release, with dates where they are
// known: the date of a release tag that was imported. Nothing else is dated.
import { spec } from '$lib/generated/spec';
import { hasChanges, parseChangelog, type DatedEntry, type ReleaseNotes } from './changelog';
import { loadSpec, specVersions, tagDate } from './source.server';
export function loadReleaseNotes(tag: string = spec.latest.tag, root = process.cwd()): ReleaseNotes {
	const loaded = loadSpec(tag, root);
	const imported = new Set(specVersions().map((v) => v.tag));
	// An "Unreleased" entry without a change ("Nothing yet.") is not shown.
	const entries = parseChangelog(loaded.document.blocks)
		.filter((entry) => !entry.unreleased || hasChanges(entry))
		.map((entry): DatedEntry => {
			const date = imported.has(entry.version) ? tagDate(entry.version, root) : undefined;
			return date ? { ...entry, date } : entry;
		});
	return loaded.date ? { tag, date: loaded.date, entries } : { tag, entries };
}
