import type { TextPage } from '../types';

// Title and lead only: the entries come from the specification (see
// src/routes/changelog/+page.server.ts).
export const changelog: TextPage = {
	title: 'changelog_title',
	intro: 'changelog_intro',
	blocks: []
};

export const relayChangelog: TextPage = {
	title: 'changelog_relay_title',
	intro: 'changelog_relay_intro',
	blocks: []
};
