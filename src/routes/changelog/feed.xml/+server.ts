import { m } from '$lib/paraglide/messages';
import { SITE_URL } from '$lib/site';
import { atomDate } from '$lib/spec/date';
import { atomFeed } from '$lib/spec/feed';
import { loadReleaseNotes } from '$lib/spec/release-notes.server';
import type { RequestHandler } from './$types';

// Atom feed of the changelog, written once at build time. The entries are the
// English text of the specification, so the feed is English only.
export const prerender = true;

const en = { locale: 'en' } as const;

export const GET: RequestHandler = () => {
	const notes = loadReleaseNotes();
	if (!notes.date) throw new Error(`no date for the release tag ${notes.tag}: the Atom feed needs one`);
	const xml = atomFeed(notes.entries, {
		page: `${SITE_URL}/changelog/`,
		spec: `${SITE_URL}/spec/v0/`,
		self: `${SITE_URL}/changelog/feed.xml`,
		title: m.changelog_feed_name({}, en),
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
};
