<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { faq } from '$lib/content/pages/faq';
	import { glossary } from '$lib/content/pages/glossary';
	import { t } from '$lib/content/text';
	import type { Block, K } from '$lib/content/types';
	import { scripts } from '$lib/generated/client';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	const locale = $derived(getLocale());
	const local = (path: string) => pathIn(path, locale);

	/** All texts of a block list, so the search also finds words inside pages. */
	const textsOf = (blocks: Block[]): string =>
		blocks
			.flatMap((b) => ('faq' in b ? b.faq.flatMap((f) => [f.q, f.a]) : 'glossary' in b ? b.glossary.flatMap((g) => [g.term, g.def]) : []))
			.map((key: K) => t(key))
			.join(' ');

	const pages = $derived([
		{ path: '/', title: m.notfound_home(), text: m.site_description() },
		{ path: '/why/', title: t('why_title'), text: t('why_intro') },
		{ path: '/how-it-works/', title: m.nav_how(), text: '' },
		{ path: '/playground/', title: m.nav_playground(), text: '' },
		{ path: '/implement/', title: m.nav_implement(), text: '' },
		{ path: '/spec/v0/', title: m.notfound_spec(), text: m.nav_spec() },
		{ path: '/faq/', title: t('faq_title'), text: `${t('faq_intro')} ${textsOf(faq.blocks)}` },
		{ path: '/glossary/', title: t('glossary_title'), text: `${t('glossary_intro')} ${textsOf(glossary.blocks)}` },
		{ path: '/security/', title: t('security_title'), text: t('security_intro') },
		{ path: '/about/', title: t('about_title'), text: t('about_intro') },
		{ path: '/changelog/', title: m.footer_changelog(), text: '' },
		{ path: '/contact/', title: m.footer_contact(), text: '' },
		{ path: '/privacy/', title: m.footer_privacy(), text: '' },
		{ path: '/imprint/', title: m.footer_imprint(), text: '' }
	]);
	const quick = $derived(pages.filter((p) => ['/', '/how-it-works/', '/playground/', '/spec/v0/'].includes(p.path)));
</script>

<svelte:head>
	<title>{m.notfound_title()} – {m.site_name()}</title>
	<meta name="robots" content="noindex" />
	<script type="module" src={scripts.notfound}></script>
</svelte:head>

<div class="wrap">
	<article class="notfound">
		<span class="big-icon"><Icon name="lost" size={36} stroke={1.5} /></span>
		<h1>{m.notfound_title()}</h1>
		<p class="lead">{m.notfound_intro()}</p>

		<div class="search js-only">
			<label for="site-search">{m.notfound_search()}</label>
			<span class="field"><Icon name="search" /><input id="site-search" type="search" placeholder={m.notfound_placeholder()} autocomplete="off" /></span>
			<p
				id="search-status"
				class="visually-hidden"
				aria-live="polite"
				data-none={m.notfound_results({ count: 0 })}
				data-one={m.notfound_results({ count: 1 })}
				data-other={m.notfound_results({ count: 2 })}
			></p>
			<ul id="search-results" class="results" hidden>
				{#each pages as page (page.path)}
					<li data-search="{page.title} {page.text}" hidden>
						<a href={local(page.path)}><strong>{page.title}</strong><Icon name="arrow" size={18} /></a>
					</li>
				{/each}
			</ul>
		</div>

		<nav class="quick" aria-label={m.notfound_search()}>
			{#each quick as page (page.path)}<a class="btn btn-secondary btn-sm" href={local(page.path)}>{page.title}</a>{/each}
		</nav>
	</article>
</div>

<style>
	.notfound {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-inline-size: 760px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
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
	.search {
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-inline-size: 520px;
		margin-block-start: 16px;
		font-size: 15px;
		color: var(--ms-text-muted);
	}
	.field {
		display: flex;
		align-items: center;
		gap: 10px;
		block-size: 52px;
		padding-inline: 14px;
		border: 1px solid var(--ms-border-strong);
		border-radius: var(--ms-radius);
		background: var(--ms-surface);
		color: var(--ms-text);
	}
	.field:focus-within {
		outline: 2px solid var(--ms-focus);
		outline-offset: 2px;
	}
	input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: transparent;
		font-size: 17px;
		outline: none;
	}
	.results {
		display: flex;
		flex-direction: column;
		margin: 6px 0 0;
		padding: 0;
		list-style: none;
		border: 1px solid var(--ms-border);
		border-radius: 12px;
		background: var(--ms-surface);
		overflow: hidden;
	}
	.results li + li {
		border-block-start: 1px solid var(--ms-border);
	}
	.results a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-block-size: 48px;
		padding-inline: 16px;
		color: var(--ms-text);
		text-decoration: none;
	}
	.results a:hover {
		background: var(--ms-surface-2);
	}
	.quick {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-block-start: 8px;
	}
</style>
