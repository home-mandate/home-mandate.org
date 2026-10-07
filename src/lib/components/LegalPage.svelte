<script lang="ts">
	import Callout from './Callout.svelte';
	import RichText from './RichText.svelte';
	import { headingId, legalText } from '$lib/content/legal';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	// Privacy policy and imprint: German is binding, English a translation,
	// other languages read the English text (marked with lang="en").
	let { page }: { page: 'privacy' | 'imprint' } = $props();

	const locale = $derived(getLocale());
	const legal = $derived(legalText(page, locale));
	const text = $derived(legal.text);
	const toc = $derived(text.blocks.flatMap((b) => ('h2' in b ? [b.h2] : [])));
</script>

<svelte:head>
	<title>{text.title} – {m.site_name()}</title>
</svelte:head>

<div class="wrap">
	<article class="legal-page" lang={legal.lang === locale ? undefined : legal.lang}>
		<header>
			<h1>{text.title}</h1>
			<p class="lead">{text.intro}</p>
		</header>
		{#each text.blocks as block, i (i)}
			{#if 'h2' in block}
				<h2 id={headingId(block.h2)}>{block.h2}</h2>
			{:else if 'h3' in block}
				<h3>{block.h3}</h3>
			{:else if 'p' in block}
				<p class={{ caps: block.caps }}><RichText text={block.p} /></p>
			{:else if 'ul' in block}
				<ul>
					{#each block.ul as item, n (n)}<li><RichText text={item} /></li>{/each}
				</ul>
			{:else if 'toc' in block}
				<nav class="toc" aria-labelledby="toc-title">
					<span class="eyebrow" id="toc-title">{block.toc}</span>
					{#each toc as heading (heading)}<a href="#{headingId(heading)}">{heading}</a>{/each}
				</nav>
			{:else if 'legal' in block}
				<dl class="facts">
					{#each block.legal as [key, value] (key)}<dt>{key}</dt><dd>{value}</dd>{/each}
				</dl>
			{:else if 'callout' in block}
				<Callout title={block.title}><p>{block.text}</p></Callout>
			{/if}
		{/each}
	</article>
</div>

<style>
	.legal-page {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-inline-size: 1000px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
	}
	header {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-block-end: 12px;
	}
	h2 {
		margin-block-start: 24px;
		font-size: clamp(22px, 1rem + 0.9vw, 30px);
	}
	h3 {
		margin-block-start: 8px;
		font-size: 19px;
	}
	p,
	ul {
		max-inline-size: 44em;
	}
	.caps {
		font-size: 15px;
		letter-spacing: 0.01em;
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding-inline-start: 22px;
	}
	.toc {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 16px 20px;
		border: 1px solid var(--ms-border);
		border-radius: 12px;
		background: var(--ms-surface);
	}
	.toc a {
		display: flex;
		align-items: center;
		min-block-size: 40px;
		color: var(--ms-text);
		font-weight: 500;
		text-decoration: none;
	}
	.toc a:hover {
		color: var(--ms-accent);
	}
	.facts {
		display: grid;
		grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
		gap: 10px 24px;
		margin: 0;
		padding: 20px;
		border: 1px dashed var(--ms-border-strong);
		border-radius: 12px;
	}
	dt {
		font-size: 15px;
		color: var(--ms-text-muted);
	}
	dd {
		margin: 0;
		font-family: var(--ms-font-mono);
		font-size: 15px;
		overflow-wrap: anywhere;
	}
	@media (max-width: 767px) {
		.facts {
			grid-template-columns: minmax(0, 1fr);
			gap: 2px;
		}
		dd + dt {
			margin-block-start: 10px;
		}
	}
</style>
