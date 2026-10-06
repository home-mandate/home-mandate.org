<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import LanguageMenu from '$lib/components/LanguageMenu.svelte';
	import { language, languages, pathIn, urlIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { SECURITY_URL, SITE_REPOSITORY, SPEC_REPOSITORY } from '$lib/site';

	let { children } = $props();

	const locale = $derived(getLocale());
	const partial = $derived(language(locale)?.complete === false);
	const path = $derived(page.url.pathname);
</script>

<svelte:head>
	<meta name="description" content={m.site_description()} />
	<link rel="canonical" href={urlIn(path, locale)} />
	{#each languages as l (l.tag)}
		<link rel="alternate" hreflang={l.tag} href={urlIn(path, l.tag)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={urlIn(path, 'en')} />
</svelte:head>

<a class="skip" href="#main">{m.nav_skip()}</a>

<header class="site-header">
	<a class="brand" href={pathIn('/', locale)}>{m.site_name()}</a>
	<nav aria-label={m.nav_main()}>
		<a href={SPEC_REPOSITORY}>{m.nav_github()}</a>
	</nav>
	<LanguageMenu />
</header>

<p class="status">{m.common_status()}</p>

{#if partial}
	<p class="notice" role="note">{m.lang_partial()}</p>
{/if}

<main id="main">
	{@render children()}
</main>

<footer class="site-footer" aria-label={m.footer_label()}>
	<p>{m.footer_license()}</p>
	<ul>
		<li><a href={pathIn('/imprint/', locale)}>{m.footer_imprint()}</a></li>
		<li><a href={pathIn('/privacy/', locale)}>{m.footer_privacy()}</a></li>
		<li><a href={SITE_REPOSITORY}>{m.footer_source()}</a></li>
		<li><a href={`${SITE_REPOSITORY}/blob/main/TRANSLATING.md`}>{m.footer_translate()}</a></li>
		<li><a href={SECURITY_URL}>{m.footer_security()}</a></li>
	</ul>
</footer>

<style>
	.skip {
		position: absolute;
		inset-inline-start: 1rem;
		inset-block-start: -10rem;
	}
	.skip:focus {
		inset-block-start: 1rem;
	}
	.site-header,
	.status,
	.notice,
	main,
	.site-footer {
		max-inline-size: 72rem;
		margin-inline: auto;
		padding-inline: var(--ms-space);
	}
	.site-header {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ms-space);
		align-items: center;
		justify-content: space-between;
		padding-block: var(--ms-space);
	}
	.brand {
		font-weight: 600;
		font-size: 1.25rem;
		color: var(--ms-fg);
		text-decoration: none;
	}
	nav {
		margin-inline-start: auto;
	}
	.status {
		color: var(--ms-muted);
		font-size: 0.875rem;
		margin-block: 0;
	}
	.notice {
		background: var(--ms-surface);
		border-radius: var(--ms-radius);
		padding-block: 0.75rem;
	}
	main {
		padding-block: 2rem 4rem;
	}
	.site-footer {
		border-block-start: 1px solid var(--ms-border);
		padding-block: 2rem;
		color: var(--ms-muted);
		font-size: 0.9375rem;
	}
	.site-footer ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		padding: 0;
		list-style: none;
	}
</style>
