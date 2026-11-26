import { m } from '#lib/paraglide/messages.js';
import { changelogFeedResponse } from '#lib/spec/changelog-feed.server.ts';
import { loadReleaseNotes } from '#lib/spec/release-notes.server.ts';
import type { RequestHandler } from './$types';

// Atom feed of the changelog of the core specification, written once at build time.
export const prerender = true;

export const GET: RequestHandler = () =>
	changelogFeedResponse(loadReleaseNotes(), {
		page: '/changelog/',
		spec: '/spec/v0/',
		self: '/changelog/feed.xml',
		title: m.changelog_feed_name({}, { locale: 'en' })
	});
