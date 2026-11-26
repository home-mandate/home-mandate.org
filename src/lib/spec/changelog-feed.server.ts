// The Atom feed of a changelog, written once at build time. The entries are the
// English text of the specification, so the feed is English only. Shared by
// /changelog/feed.xml (core) and /changelog/relay/feed.xml (Relay Specification).
import { m } from '#lib/paraglide/messages.js';
import { SITE_URL } from '#lib/site.ts';
import type { ReleaseNotes } from './changelog';
import { atomDate } from './date';
import { atomFeed } from './feed';

const en = { locale: 'en' } as const;

export interface ChangelogFeed {
	/** Path of the changelog page, e.g. /changelog/ */
	page: string;
	/** Path of the reader the entries link into, e.g. /spec/v0/ */
	spec: string;
	/** Path of the feed itself, e.g. /changelog/feed.xml */
	self: string;
	title: string;
}

export function changelogFeedResponse(notes: ReleaseNotes, feed: ChangelogFeed): Response {
	if (!notes.date) throw new Error(`no date for the release tag ${notes.tag}: the Atom feed needs one`);
	const xml = atomFeed(notes.entries, {
		page: `${SITE_URL}${feed.page}`,
		spec: `${SITE_URL}${feed.spec}`,
		self: `${SITE_URL}${feed.self}`,
		title: feed.title,
		kinds: {
			added: m.changelog_kind_added({}, en),
			changed: m.changelog_kind_changed({}, en),
			fixed: m.changelog_kind_fixed({}, en),
			removed: m.changelog_kind_removed({}, en),
			incompatible: m.changelog_kind_incompatible({}, en),
			clarified: m.changelog_kind_clarified({}, en)
		},
		updated: atomDate(notes.date),
		entryUpdated: (entry) => ('date' in entry && typeof entry.date === 'string' ? atomDate(entry.date) : undefined),
		entryTitle: (entry) => (entry.unreleased ? `${entry.version} (${m.changelog_as_of({ version: notes.tag }, en)})` : entry.version)
	});
	return new Response(xml, { headers: { 'content-type': 'application/atom+xml; charset=utf-8' } });
}
