<script lang="ts">
	import Icon from '../Icon.svelte';
	import SpecBlocks from './SpecBlocks.svelte';
	import SpecToc from './SpecToc.svelte';
	import SpecVersionSelect from './SpecVersionSelect.svelte';
	import { scripts } from '$lib/generated/client';
	import { pathIn } from '$lib/locale';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { SITE_URL, SPEC_REPOSITORY } from '$lib/site';
	import { formatDate } from '$lib/spec/date';
	import type { LoadedSpec, SpecVersion } from '$lib/spec/types';

	// The specification reader: the English text of one imported release with
	// its table of contents, version choice, link to GitHub and a print layout.
	let { spec, versions, file, noindex = false }: { spec: LoadedSpec; versions: SpecVersion[]; file: string; noindex?: boolean } = $props();

	const locale = $derived(getLocale());
	const latest = $derived(versions.find((v) => v.latest) ?? versions[0]);
	const isOld = $derived(latest !== undefined && latest.tag !== spec.tag);
	const pathOf = (v: SpecVersion) => (v.latest ? '/spec/v0/' : `/spec/v0/${v.tag}/`);
	const options = $derived(versions.map((v) => ({ ...v, href: pathIn(pathOf(v), locale) })));
	const current = $derived(versions.find((v) => v.tag === spec.tag) ?? { tag: spec.tag, latest: false });
	const github = $derived(`${SPEC_REPOSITORY}/blob/${spec.tag}/${file}`);
	const printUrl = $derived(`${SITE_URL.replace(/^https:\/\//, '')}${pathOf(current)}`);
	const first = $derived(spec.document.toc[0]);
</script>

<svelte:head>
	<title>{m.spec_page_title({ version: spec.tag })} – {m.site_name()}</title>
	<meta name="description" content={m.spec_description({ version: spec.tag })} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}
	<script type="module" src={scripts.spec}></script>
</svelte:head>

<div class="reader">
	<div class="bar no-print">
		<nav class="crumbs" aria-label={m.spec_breadcrumb()}>
			<ol>
				<li><a href={pathIn('/spec/v0/', locale)}>{m.spec_crumb()}</a></li>
				<li><span class="mono" aria-current="page">{spec.tag}</span></li>
				{#if first}<li class="js-only"><span class="current" lang="en" data-spec-current>{first.text}</span></li>{/if}
			</ol>
		</nav>
		<SpecVersionSelect versions={options} current={spec.tag} />
		<a class="tool github" href={github}><Icon name="github" size={17} />{m.spec_github()}<span class="visually-hidden">{m.common_external()}</span></a>
		<button type="button" class="tool print js-only" data-spec-print><Icon name="print" size={17} />{m.spec_print()}</button>
	</div>

	{#if isOld && latest}
		<div class="old no-print" role="status">
			<Icon name="clock" size={20} stroke={1.9} />
			<p><strong>{m.spec_old_title()}</strong> {m.spec_old_body()}</p>
			<a class="to-latest" href={pathIn('/spec/v0/', locale)}>{m.spec_to_latest({ version: latest.tag })}</a>
		</div>
	{/if}
	{#if locale !== 'en'}
		<div class="en-only no-print" role="note"><Icon name="globe" size={20} /><p>{m.lang_spec_english()}</p></div>
	{/if}

	<div class="phone-bar no-print">
		<details class="toc-sheet" data-popover="toc">
			<summary>
				<Icon name="contents" size={18} stroke={2} />
				<span class="summary-text"
					><span class="visually-hidden js-only">{m.spec_contents()}: </span><span class="muted" data-spec-current-num></span>
					<span lang="en" data-spec-current data-spec-fallback={m.spec_contents()}>{m.spec_contents()}</span></span
				>
				<Icon name="chevron" size={16} stroke={2} />
			</summary>
			<div class="sheet"><SpecToc toc={spec.document.toc} label={m.spec_toc()} variant="sheet" /></div>
		</details>
		<SpecVersionSelect versions={options} current={spec.tag} compact />
	</div>

	<div class="layout">
		<aside class="side no-print">
			<p class="eyebrow">{m.spec_contents()}</p>
			<SpecToc toc={spec.document.toc} label={m.spec_toc()} variant="side" />
		</aside>

		<article class="content" lang="en" data-spec-content>
			<div class="print-head" aria-hidden="true"><span>mandate-spec {spec.tag} · {m.spec_draft_badge()}</span><span>{printUrl}</span></div>
			<div class="meta">
				<span class="draft" lang={locale}><span class="dot" aria-hidden="true"></span>{m.spec_draft_badge()}</span>
				<span class="tag mono">{spec.tag}</span>
				{#if spec.date}<time datetime={spec.date} lang={locale}>{formatDate(spec.date, locale)}</time>{/if}
			</div>
			<h1>{spec.document.title}</h1>
			<a class="github-phone no-print" href={github} lang={locale}
				><Icon name="github" size={17} />{m.spec_github()}<span class="visually-hidden">{m.common_external()}</span></a
			>
			<SpecBlocks blocks={spec.document.blocks} />
		</article>
	</div>
</div>

<style>
	/* Bar under the header: breadcrumbs, version, GitHub, print. */
	.bar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-block: 14px;
		padding-inline: var(--header-pad);
		border-block-end: 1px solid var(--ms-border);
		background: var(--ms-surface);
		font-size: 15px;
	}
	.crumbs {
		flex: 1;
		min-inline-size: 0;
	}
	.crumbs ol {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
		color: var(--ms-text-muted);
		white-space: nowrap;
	}
	.crumbs li {
		display: flex;
		align-items: center;
		gap: 8px;
		min-inline-size: 0;
	}
	.crumbs li + li::before {
		content: '›';
	}
	.crumbs a {
		color: var(--ms-text-muted);
		text-decoration: none;
	}
	.crumbs a:hover {
		text-decoration: underline;
	}
	.crumbs .mono {
		font-size: 14px;
	}
	.current {
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--ms-text);
		font-weight: 600;
	}
	.tool {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
		block-size: 40px;
		padding-inline: 12px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		color: var(--ms-text);
		font-size: 15px;
		text-decoration: none;
		cursor: pointer;
	}
	.tool:hover {
		background: var(--ms-surface-2);
	}
	.print {
		border-color: var(--ms-border);
	}

	/* Notices: older version (ask colours), English only. */
	.old,
	.en-only {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-block: 12px;
		padding-inline: var(--header-pad);
		border-block-end: 1px solid var(--ms-border);
		font-size: 15.5px;
	}
	.old {
		background: var(--ms-ask-bg);
		border-color: var(--ms-ask-border);
	}
	.old > :global(svg) {
		color: var(--ms-ask-fg);
	}
	.old p,
	.en-only p {
		flex: 1;
	}
	.old strong {
		font-weight: 650;
	}
	.to-latest {
		display: inline-flex;
		align-items: center;
		min-block-size: 36px;
		padding-inline: 14px;
		border: 1px solid var(--ms-ask-border);
		border-radius: 8px;
		background: var(--ms-surface);
		color: var(--ms-text);
		font-size: 14.5px;
		font-weight: 600;
		text-decoration: none;
	}
	.en-only {
		background: var(--ms-surface-2);
	}

	/* Phone: sticky row with the current section and the version. */
	.phone-bar {
		display: none;
	}

	.layout {
		display: grid;
		grid-template-columns: 300px minmax(0, 1fr);
		gap: 72px;
		max-inline-size: var(--page-max);
		padding-inline: var(--header-pad);
	}
	.side {
		position: sticky;
		inset-block-start: 0;
		align-self: start;
		max-block-size: 100vh;
		overflow: auto;
		padding-block: 40px;
	}
	.side .eyebrow {
		margin-block-end: 12px;
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-inline-size: 0;
		max-inline-size: 760px;
		padding-block: 40px 96px;
		font-size: 17px;
		line-height: 1.6;
	}
	.content :global(code) {
		font-size: 0.85em;
		overflow-wrap: anywhere;
	}
	.content :global(:not(pre) > code) {
		border: 1px solid var(--ms-border);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.draft {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 3px 10px;
		border-radius: 6px;
		background: var(--ms-band-bg);
		color: var(--ms-band-fg);
		font-size: 12.5px;
		font-weight: 600;
	}
	.dot {
		inline-size: 6px;
		block-size: 6px;
		border-radius: 50%;
		background: var(--ms-ask-fg);
	}
	.tag {
		padding: 3px 10px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		font-size: 12.5px;
	}
	time {
		font-size: 14px;
		color: var(--ms-text-muted);
	}
	h1 {
		font-size: 44px;
		line-height: 1.1;
		text-wrap: wrap;
	}
	.github-phone {
		display: none;
	}
	.print-head {
		display: none;
	}

	@media (max-width: 1023px) {
		.bar,
		.side {
			display: none;
		}
		.layout {
			display: block;
			padding-inline: 16px;
		}
		.old,
		.en-only {
			flex-wrap: wrap;
			padding-inline: 16px;
			font-size: 15px;
		}
		.to-latest {
			min-block-size: 44px;
		}
		.phone-bar {
			position: sticky;
			inset-block-start: 0;
			z-index: 3;
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 16px;
			border-block-end: 1px solid var(--ms-border);
			background: var(--ms-bg);
		}
		.toc-sheet {
			flex: 1;
			min-inline-size: 0;
		}
		.toc-sheet summary {
			display: flex;
			align-items: center;
			gap: 10px;
			block-size: 48px;
			padding-inline: 12px;
			border: 1px solid var(--ms-border-strong);
			border-radius: 10px;
			background: var(--ms-surface);
			font-size: 15px;
			cursor: pointer;
			list-style: none;
		}
		.toc-sheet summary::-webkit-details-marker {
			display: none;
		}
		.toc-sheet[open] summary > :global(svg:last-child) {
			transform: rotate(180deg);
		}
		.summary-text {
			flex: 1;
			min-inline-size: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.sheet {
			position: absolute;
			inset-inline: 0;
			inset-block-start: 100%;
			max-block-size: min(420px, 70vh);
			overflow: auto;
			padding: 4px 16px 12px;
			border-block: 1px solid var(--ms-border);
			background: var(--ms-bg);
			box-shadow: var(--ms-shadow-2);
		}
		.content {
			gap: 14px;
			padding-block: 24px 56px;
			font-size: 16.5px;
		}
		.content :global([id]) {
			scroll-margin-block-start: 80px;
		}
		h1 {
			font-size: 32px;
			line-height: 1.15;
		}
		.meta .tag {
			display: none;
		}
		.github-phone {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			align-self: flex-start;
			min-block-size: 44px;
			color: var(--ms-accent);
			font-weight: 600;
			text-decoration: none;
		}
	}

	@media (forced-colors: active) {
		.draft,
		.tag,
		.toc-sheet summary {
			border: 1px solid CanvasText;
		}
	}

	/* Print: black on white, no navigation, a header line with version and
	   address, one A4 column. The site header and footer are hidden too. */
	@media print {
		:global(:root:root:root) {
			--ms-bg: white;
			--ms-surface: white;
			--ms-surface-2: white;
			--ms-text: black;
			--ms-text-muted: dimgray;
			--ms-accent: black;
			--ms-border: silver;
			--ms-border-strong: gray;
			--ms-band-bg: white;
			--ms-band-fg: black;
		}
		:global(.skip),
		:global(.band),
		:global(header.header),
		:global(.partial),
		:global(footer.footer),
		:global(.copy),
		:global(.tools) {
			display: none !important;
		}
		.layout {
			display: block;
			padding: 0;
		}
		.content {
			max-inline-size: none;
			padding: 0;
			font-size: 11pt;
			line-height: 1.55;
			gap: 8px;
		}
		.print-head {
			display: flex;
			justify-content: space-between;
			padding-block-end: 10px;
			margin-block-end: 16px;
			border-block-end: 1px solid gray;
			font: 9pt var(--ms-font-mono);
		}
		h1 {
			font-size: 24pt;
		}
		.draft {
			border: 1px solid black;
		}
		.content :global(a) {
			text-decoration: none;
		}
		.content :global(pre) {
			white-space: pre-wrap;
			overflow: visible;
		}
		.content :global(.table-scroll) {
			overflow: visible;
		}
		.content :global(table) {
			min-inline-size: 0;
			font-size: 9.5pt;
		}
		.content :global(.d2) {
			margin-block-start: 16px;
			font-size: 14pt;
		}
		.content :global(.d3) {
			font-size: 12pt;
		}
		.content :global(h2),
		.content :global(h3) {
			break-after: avoid;
		}
		.content :global(tr),
		.content :global(figure) {
			break-inside: avoid;
		}
	}
	@page {
		size: A4;
		margin: 18mm 20mm;
	}
</style>
