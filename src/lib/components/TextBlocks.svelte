<script lang="ts">
	import Callout from './Callout.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import Icon from './Icon.svelte';
	import RichText from './RichText.svelte';
	import StepNumber from './StepNumber.svelte';
	import TechDetails from './TechDetails.svelte';
	import { ALPHABET, groupByInitial } from '$lib/content/glossary';
	import { t } from '$lib/content/text';
	import type { Block } from '$lib/content/types';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';

	let { blocks }: { blocks: Block[] } = $props();

	const locale = $derived(getLocale());
	const href = (target: string) => (target.startsWith('/') ? pathIn(target, locale) : target);
	const marks = { allow: 'check', ask: 'ask', deny: 'close' } as const;
	const toc = $derived(blocks.flatMap((b) => ('h2' in b ? [{ id: b.id, text: t(b.h2) }] : [])));
</script>

{#each blocks as block, i (i)}
	{#if 'h2' in block}
		<h2 id={block.id}>{t(block.h2)}</h2>
	{:else if 'h3' in block}
		<h3 id={block.id}>{t(block.h3)}</h3>
	{:else if 'p' in block}
		<p class="prose"><RichText text={t(block.p)} /></p>
	{:else if 'ul' in block}
		<ul class="dots prose">
			{#each block.ul as item (item)}<li><RichText text={t(item)} /></li>{/each}
		</ul>
	{:else if 'toc' in block}
		<nav class="toc" aria-labelledby="toc-{i}">
			<span class="eyebrow" id="toc-{i}">{t(block.toc)}</span>
			{#each toc as entry (entry.id)}<a href="#{entry.id}">{entry.text}</a>{/each}
		</nav>
	{:else if 'compare' in block}
		<div class="grid two">
			{#each block.compare as col (col.title)}
				<div class="compare {col.tone}">
					<p class="compare-title"><span class="tile"><Icon name={col.icon} /></span><strong>{t(col.title)}</strong></p>
					<ul>
						{#each col.items as item (item)}<li><Icon name={marks[col.tone]} size={18} stroke={2.4} />{t(item)}</li>{/each}
					</ul>
				</div>
			{/each}
		</div>
	{:else if 'story' in block}
		<ol class="grid three story">
			{#each block.story as step, n (step.title)}
				<li class="card">
					<span class="row"><StepNumber n={n + 1} size={30} /><span class="tile {step.tone}"><Icon name={step.icon} /></span></span>
					<strong>{t(step.title)}</strong>
					<span class="muted">{t(step.body)}</span>
				</li>
			{/each}
		</ol>
	{:else if 'tech' in block}
		<TechDetails title={t(block.tech)}>
			{#each block.text as para (para)}<p><RichText text={t(para)} /></p>{/each}
		</TechDetails>
	{:else if 'callout' in block}
		<Callout title={t(block.callout)} icon={block.icon} tone={block.tone}>
			{#each block.text as para (para)}<p><RichText text={t(para)} /></p>{/each}
			{#if block.link}<a class="text-link" href={href(block.link.href)}>{t(block.link.text)}<Icon name="arrow" size={18} /></a>{/if}
		</Callout>
	{:else if 'faq' in block}
		<div class="faq">
			{#each block.faq as item, n (item.id)}
				<details id={item.id} open={n === 0}>
					<summary><span>{t(item.q)}</span><span class="sign" aria-hidden="true"><Icon name="plus" size={16} stroke={2} /></span></summary>
					<div class="answer">
						<p><RichText text={t(item.a)} /></p>
						<a class="anchor mono" href="#{item.id}">#{item.id}</a>
					</div>
				</details>
			{/each}
		</div>
	{:else if 'glossary' in block}
		{@const groups = groupByInitial(
			block.glossary.map((e) => ({ term: t(e.term), item: e })),
			locale
		)}
		{@const present = new Set(groups.map((g) => g.letter))}
		<div class="glossary">
			<nav class="az" aria-label="A–Z">
				{#each ALPHABET as letter (letter)}
					{#if present.has(letter)}<a href="#g-{letter}">{letter}</a>{:else}<span aria-hidden="true">{letter}</span>{/if}
				{/each}
			</nav>
			{#each groups as group (group.letter)}
				<section id="g-{group.letter}" class="group" aria-label={group.letter}>
					<span class="letter" aria-hidden="true">{group.letter}</span>
					<dl>
						{#each group.entries as entry (entry.term)}
							<div>
								<dt>{entry.term} <code>{entry.item.code}</code></dt>
								<dd>{t(entry.item.def)}</dd>
							</div>
						{/each}
					</dl>
				</section>
			{/each}
		</div>
	{:else if 'list' in block}
		<ol class="numbered">
			{#each block.list as item, n (item.title)}
				<li><StepNumber n={n + 1} /><span><strong>{t(item.title)}</strong><span class="muted">{t(item.body)}</span></span></li>
			{/each}
		</ol>
	{:else if 'process' in block}
		<ol class="process">
			{#each block.process as step, n (step.title)}
				{#if n > 0}<li class="arrow" aria-hidden="true"><Icon name="arrow" /></li>{/if}
				<li class="node">
					<span class="row"><Icon name={step.icon} /><strong>{t(step.title)}</strong></span>
					<span class="muted">{t(step.body)}</span>
				</li>
			{/each}
		</ol>
	{:else if 'cards' in block}
		<div class="grid three">
			{#each block.cards as card (card.title)}
				<a class="card link-card" href={href(card.href)}>
					<span class="tile"><Icon name={card.icon} /></span>
					<strong>{t(card.title)}</strong>
					<span class="muted">{t(card.body)}</span>
					<span class="more">{t(card.link)}<Icon name="arrow" size={18} /></span>
				</a>
			{/each}
		</div>
	{:else if 'code' in block}
		<CodeBlock code={block.code} file={block.file} id="code-{i}" />
	{/if}
{/each}

<style>
	h2 {
		margin-block-start: 16px;
	}
	h3 {
		margin-block: 8px -8px;
	}
	.prose {
		max-inline-size: 44em;
	}
	.prose :global(a) {
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.dots {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.dots li {
		position: relative;
		padding-inline-start: 18px;
	}
	.dots li::before {
		content: '';
		position: absolute;
		inset-inline-start: 0;
		inset-block-start: 11px;
		inline-size: 6px;
		block-size: 6px;
		border-radius: 50%;
		background: var(--ms-border-strong);
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
	.toc .eyebrow {
		margin-block-end: 6px;
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
	.grid {
		display: grid;
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.tile {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		flex: none;
		border-radius: 10px;
		background: var(--ms-surface-2);
	}
	.tile.allow,
	.compare.allow .tile {
		color: var(--ms-allow-fg);
	}
	.tile.ask {
		color: var(--ms-ask-fg);
	}
	.tile.deny,
	.compare.deny .tile {
		color: var(--ms-deny-fg);
	}
	.compare {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 24px;
		border: 1.5px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.compare.allow {
		border-color: var(--ms-allow-border);
	}
	.compare.deny {
		border-color: var(--ms-deny-border);
	}
	.compare-title {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 20px;
	}
	.compare-title strong {
		font-weight: 650;
	}
	.compare ul {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.compare li {
		display: flex;
		gap: 10px;
		font-size: 16px;
	}
	.compare li :global(svg) {
		margin-block-start: 3px;
	}
	.compare.allow li :global(svg) {
		color: var(--ms-allow-fg);
	}
	.compare.deny li :global(svg) {
		color: var(--ms-deny-fg);
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.card strong {
		font-size: 18px;
		font-weight: 650;
	}
	.card .muted {
		font-size: 15.5px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.link-card {
		gap: 8px;
		padding: 22px;
		color: var(--ms-text);
		text-decoration: none;
	}
	.link-card:hover {
		border-color: var(--ms-border-strong);
		box-shadow: var(--ms-shadow-1);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-block-start: auto;
		padding-block-start: 6px;
		color: var(--ms-accent);
		font-weight: 600;
	}
	.faq {
		display: flex;
		flex-direction: column;
		border-block-start: 1px solid var(--ms-border);
	}
	.faq details {
		border-block-end: 1px solid var(--ms-border);
	}
	.faq summary {
		display: flex;
		align-items: center;
		gap: 12px;
		min-block-size: 60px;
		padding-block: 8px;
		font-size: 18px;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}
	.faq summary::-webkit-details-marker {
		display: none;
	}
	.faq summary span:first-child {
		flex: 1;
	}
	.sign {
		display: grid;
		place-items: center;
		inline-size: 30px;
		block-size: 30px;
		flex: none;
		border: 1px solid var(--ms-border-strong);
		border-radius: 50%;
	}
	.faq [open] .sign :global(svg) {
		transform: rotate(45deg);
	}
	.answer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-block-end: 20px;
		padding-inline-end: 44px;
		color: var(--ms-text-muted);
	}
	.anchor {
		font-size: 13px;
		color: var(--ms-text-muted);
		inline-size: fit-content;
	}
	.glossary {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.az {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.az a,
	.az span {
		display: grid;
		place-items: center;
		inline-size: 36px;
		block-size: 36px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 8px;
		color: var(--ms-text);
		font-weight: 600;
		text-decoration: none;
	}
	.az a:hover {
		background: var(--ms-surface-2);
	}
	.az span {
		border-color: var(--ms-border);
		color: var(--ms-text-muted);
		opacity: 0.6;
	}
	.group {
		display: grid;
		grid-template-columns: 80px minmax(0, 1fr);
		gap: 16px;
		padding-block-start: 16px;
		border-block-start: 1px solid var(--ms-border);
	}
	.letter {
		font-size: 28px;
		font-weight: 700;
		color: var(--ms-text-muted);
	}
	dl {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin: 0;
	}
	dt {
		font-weight: 650;
	}
	dt code {
		margin-inline-start: 6px;
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	dd {
		margin: 0;
		color: var(--ms-text-muted);
	}
	.numbered {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
		border-block-start: 1px solid var(--ms-border);
	}
	.numbered li {
		display: flex;
		gap: 16px;
		padding-block: 16px;
		border-block-end: 1px solid var(--ms-border);
	}
	.numbered li > span {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.numbered strong {
		font-weight: 650;
	}
	.numbered .muted {
		font-size: 16px;
	}
	.process {
		display: flex;
		align-items: stretch;
		margin: 0;
		padding: 24px;
		list-style: none;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.node {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 12px;
		background: var(--ms-bg);
	}
	.node .muted {
		font-size: 14.5px;
	}
	.arrow {
		display: grid;
		place-items: center;
		inline-size: 32px;
		flex: none;
		color: var(--ms-text-muted);
	}
	@media (max-width: 1023px) {
		.three {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 767px) {
		.two {
			grid-template-columns: minmax(0, 1fr);
		}
		.process {
			flex-direction: column;
			padding: 16px;
		}
		.arrow {
			inline-size: auto;
			block-size: 32px;
		}
		.arrow :global(svg) {
			transform: rotate(90deg);
		}
		.group {
			grid-template-columns: 40px minmax(0, 1fr);
		}
		.faq summary {
			font-size: 17px;
		}
		.answer {
			padding-inline-end: 0;
		}
	}
</style>
