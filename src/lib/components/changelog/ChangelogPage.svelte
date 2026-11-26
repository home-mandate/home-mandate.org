<script lang="ts">
	import Callout from '../Callout.svelte';
	import Icon from '../Icon.svelte';
	import TextPageView from '../TextPageView.svelte';
	import DocSwitch from '../spec/DocSwitch.svelte';
	import ChangelogList from './ChangelogList.svelte';
	import { changelog, relayChangelog } from '#lib/content/pages/changelog.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { ReleaseNotes } from '#lib/spec/changelog.ts';

	// /changelog/ (core specification) and /changelog/relay/ (Relay Specification):
	// the same page, each with its own feed. The entries are the English text of
	// the specification, so each feed serves every language.
	let { notes, doc }: { notes: ReleaseNotes; doc: 'spec' | 'relay' } = $props();

	const DOCS = {
		spec: { page: changelog, feed: '/changelog/feed.xml', feedName: m.changelog_feed_name, reader: '/spec/v0/' },
		relay: { page: relayChangelog, feed: '/changelog/relay/feed.xml', feedName: m.changelog_relay_feed_name, reader: '/relay/v0/' }
	} as const;
	const d = $derived(DOCS[doc]);
</script>

<svelte:head>
	<link rel="alternate" type="application/atom+xml" title={d.feedName()} href={d.feed} />
</svelte:head>

<TextPageView page={d.page}>
	<DocSwitch current={doc} paths={{ spec: '/changelog/', relay: '/changelog/relay/' }} variant="inline" />
	<Callout title={m.changelog_feed_title()} icon="feed">
		<p>{m.changelog_feed_text()}</p>
		<a class="text-link" href={d.feed} type="application/atom+xml">{m.changelog_feed_link()}<Icon name="arrow" size={18} /></a>
	</Callout>
	{#if getLocale() !== 'en'}<p class="english muted">{m.changelog_english()}</p>{/if}
	<ChangelogList {notes} base={d.reader} />
</TextPageView>

<style>
	.english {
		font-size: 15px;
	}
</style>
