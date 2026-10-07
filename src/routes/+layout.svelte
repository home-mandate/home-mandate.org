<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import StatusBand from '$lib/components/StatusBand.svelte';
	import { scripts } from '$lib/generated/client';
	import { language, languages, urlIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { TRANSLATING_URL } from '$lib/site';

	let { children } = $props();

	const locale = $derived(getLocale());
	const partial = $derived(language(locale)?.complete === false);
	const path = $derived(page.url.pathname);
	// The 404 page is served for unknown addresses: no canonical or alternates.
	const indexable = $derived(page.route.id !== '/404');
	const home = $derived(page.route.id === '/');
</script>

<svelte:head>
	<!-- Theme before the first paint: a classic script, not deferred. -->
	<script src={scripts.themeBoot}></script>
	<script type="module" src={scripts.site}></script>
	<meta name="description" content={m.site_description()} />
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/icons/icon-180.png" />
	{#if indexable}
		<link rel="canonical" href={urlIn(path, locale)} />
		{#each languages as l (l.tag)}
			<link rel="alternate" hreflang={l.tag} href={urlIn(path, l.tag)} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={urlIn(path, 'en')} />
	{/if}
</svelte:head>

<a class="skip" href="#main">{m.nav_skip()}</a>
<StatusBand />
<SiteHeader />

{#if partial}
	<div class="partial" role="note">
		<div class="wrap inner">
			<Icon name="info" />
			<p>{m.lang_partial()} <a href={TRANSLATING_URL}>{m.lang_help()}</a></p>
		</div>
	</div>
{/if}

<main id="main" tabindex="-1">
	{@render children()}
</main>

<SiteFooter variant={home ? 'full' : 'compact'} />

<style>
	.skip {
		position: absolute;
		z-index: 100;
		inset-inline-start: 16px;
		inset-block-start: -10rem;
		padding: 10px 16px;
		border-radius: var(--ms-radius);
		background: var(--ms-btn-bg);
		color: var(--ms-btn-fg);
		font-weight: 600;
	}
	.skip:focus {
		inset-block-start: 16px;
	}
	main:focus {
		outline: none;
	}
	.partial {
		background: var(--ms-ask-bg);
		border-block-end: 1px solid var(--ms-ask-border);
		font-size: 14.5px;
	}
	.inner {
		display: flex;
		gap: 10px;
		padding-block: 12px;
		color: var(--ms-text);
	}
	.inner :global(svg) {
		color: var(--ms-ask-fg);
		margin-block-start: 1px;
	}
	.partial a {
		font-weight: 600;
	}
</style>
