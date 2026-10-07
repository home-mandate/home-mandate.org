<script lang="ts">
	import Callout from '$lib/components/Callout.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import TextPageView from '$lib/components/TextPageView.svelte';
	import ChangelogList from '$lib/components/changelog/ChangelogList.svelte';
	import { changelog } from '$lib/content/pages/changelog';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	let { data } = $props();

	// One feed for all languages: its entries are the English text of the specification.
	const FEED = '/changelog/feed.xml';
</script>

<svelte:head>
	<link rel="alternate" type="application/atom+xml" title={m.changelog_feed_name()} href={FEED} />
</svelte:head>

<TextPageView page={changelog}>
	<Callout title={m.changelog_feed_title()} icon="feed">
		<p>{m.changelog_feed_text()}</p>
		<a class="text-link" href={FEED} type="application/atom+xml">{m.changelog_feed_link()}<Icon name="arrow" size={18} /></a>
	</Callout>
	{#if getLocale() !== 'en'}<p class="english muted">{m.changelog_english()}</p>{/if}
	<ChangelogList notes={data.notes} />
</TextPageView>

<style>
	.english {
		font-size: 15px;
	}
</style>
