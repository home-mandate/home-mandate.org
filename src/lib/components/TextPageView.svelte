<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import TextBlocks from './TextBlocks.svelte';
	import { t } from '$lib/content/text';
	import type { TextPage } from '$lib/content/types';
	import { m } from '$lib/paraglide/messages';
	import { plain } from '$lib/rich';

	// One template for all text pages (why, security, faq, ...): title, lead,
	// blocks. Pages may add their own content after the blocks.
	let { page, children, noindex = false }: { page: TextPage; children?: Snippet; noindex?: boolean } = $props();
</script>

<svelte:head>
	<title>{t(page.title)} – {m.site_name()}</title>
	<meta name="description" content={plain(t(page.intro))} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}
</svelte:head>

<div class="wrap"><article class="text-page">
	<header class="intro">
		{#if page.icon}<span class="big-icon"><Icon name={page.icon} size={36} stroke={1.5} /></span>{/if}
		{#if page.eyebrow}<span class="eyebrow-mono mono">{page.eyebrow}</span>{/if}
		<h1>{t(page.title)}</h1>
		<p class="lead">{t(page.intro)}</p>
	</header>
	<TextBlocks blocks={page.blocks} />
	{#if children}{@render children()}{/if}
</article></div>

<style>
	.text-page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-inline-size: 1000px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.intro .lead {
		max-inline-size: 40em;
	}
	.big-icon {
		display: grid;
		place-items: center;
		inline-size: 72px;
		block-size: 72px;
		margin-block-end: 8px;
		border-radius: 18px;
		background: var(--ms-surface-2);
	}
	.eyebrow-mono {
		font-size: 13.5px;
		color: var(--ms-text-muted);
		overflow-wrap: anywhere;
	}
</style>
