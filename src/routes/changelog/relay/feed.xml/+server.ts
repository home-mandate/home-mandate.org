import { m } from '#lib/paraglide/messages.js';
import { loadRelayReleaseNotes } from '#lib/relay/source.server.ts';
import { changelogFeedResponse } from '#lib/spec/changelog-feed.server.ts';
import type { RequestHandler } from './$types';

// Atom feed of the changelog of the Relay Specification, written once at build time.
export const prerender = true;

export const GET: RequestHandler = () =>
	changelogFeedResponse(loadRelayReleaseNotes(), {
		page: '/changelog/relay/',
		spec: '/relay/v0/',
		self: '/changelog/relay/feed.xml',
		title: m.changelog_relay_feed_name({}, { locale: 'en' })
	});
