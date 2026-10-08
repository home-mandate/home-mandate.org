<script lang="ts">
	import CodeBlock from '../CodeBlock.svelte';
	import SpecBlocks from './SpecBlocks.svelte';
	import SpecInline from './SpecInline.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { Block } from '$lib/spec/types';

	// Block nodes of the specification (recursive for lists and quotes).
	// prefix keeps the ids of code blocks unique on the page.
	let { blocks, prefix = 'spec' }: { blocks: Block[]; prefix?: string } = $props();

	const locale = $derived(getLocale());
	const level = (depth: number) => `h${Math.min(Math.max(depth, 2), 6)}`;
</script>

{#each blocks as block, i (i)}
	{#if block.type === 'heading'}
		<!-- The anchor link sits next to the heading, so it is not part of its name. -->
		<div class="heading d{block.depth}">
			<svelte:element this={level(block.depth)} id={block.id}>
				{#if block.number}<span class="num">{block.number}</span>{/if}<span class="title"><SpecInline nodes={block.title} /></span>
			</svelte:element>
			<a class="anchor no-print" href="#{block.id}" aria-label={m.spec_anchor({ section: block.text })} lang={locale}>#</a>
		</div>
	{:else if block.type === 'paragraph'}
		{#if block.tight}<SpecInline nodes={block.inline} />{:else}<p><SpecInline nodes={block.inline} /></p>{/if}
	{:else if block.type === 'list'}
		{#if block.ordered}
			<ol start={block.start}>
				{#each block.items as item, n (n)}<li><SpecBlocks blocks={item.blocks} prefix="{prefix}-{i}-{n}" /></li>{/each}
			</ol>
		{:else}
			<ul>
				{#each block.items as item, n (n)}<li><SpecBlocks blocks={item.blocks} prefix="{prefix}-{i}-{n}" /></li>{/each}
			</ul>
		{/if}
	{:else if block.type === 'table'}
		<!-- Wide tables scroll sideways; the region is reachable by keyboard (WCAG 2.1.1). -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="table-scroll" role="region" aria-label={m.spec_table()} lang={locale} tabindex="0">
			<table lang="en">
				<thead>
					<tr>
						{#each block.header as cell, c (c)}<th scope="col" class={block.align[c] ?? ''}><SpecInline nodes={cell} /></th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each block.rows as row, r (r)}
						<tr>
							{#each row as cell, c (c)}<td class={block.align[c] ?? ''}><SpecInline nodes={cell} /></td>{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if block.type === 'code'}
		<CodeBlock code={block.text} file={block.lang || undefined} id="{prefix}-code-{i}" />
	{:else if block.type === 'blockquote'}
		<blockquote><SpecBlocks blocks={block.blocks} prefix="{prefix}-{i}" /></blockquote>
	{:else if block.type === 'hr'}
		<hr />
	{/if}
{/each}

<style>
	.heading {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-block-start: 16px;
	}
	.heading > :first-child {
		display: flex;
		align-items: baseline;
		column-gap: 12px;
		min-inline-size: 0;
		font-size: inherit;
		line-height: 1.25;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.d2 {
		margin-block-start: 32px;
		font-size: 28px;
	}
	.d3 {
		font-size: 22px;
	}
	.d4,
	.d5,
	.d6 {
		font-size: 18px;
	}
	.num {
		font-family: var(--ms-font-mono);
		font-size: 0.7em;
		font-weight: 500;
		color: var(--ms-text-muted);
	}
	.title {
		min-inline-size: 0;
	}
	.anchor {
		display: inline-grid;
		place-items: center;
		min-inline-size: 24px;
		min-block-size: 24px;
		font-size: 0.75em;
		color: var(--ms-text-muted);
		text-decoration: none;
		opacity: 0.5;
	}
	.anchor:hover,
	.anchor:focus-visible {
		opacity: 1;
	}
	ul,
	ol {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
		padding-inline-start: 1.5em;
	}
	li > :global(ul),
	li > :global(ol) {
		margin-block-start: 6px;
	}
	li :global(p + p) {
		margin-block-start: 8px;
	}
	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--ms-border);
		border-radius: 10px;
	}
	table {
		inline-size: 100%;
		min-inline-size: 560px;
		border-collapse: collapse;
		font-size: 15px;
		line-height: 1.45;
	}
	th,
	td {
		padding: 9px 12px;
		text-align: start;
		vertical-align: top;
	}
	th {
		background: var(--ms-surface-2);
		font-weight: 650;
	}
	td {
		border-block-start: 1px solid var(--ms-border);
	}
	.center {
		text-align: center;
	}
	.right {
		text-align: end;
	}
	blockquote {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 0;
		padding: 12px 16px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 10px;
		background: var(--ms-surface);
	}
	hr {
		inline-size: 100%;
		margin-block: 8px;
		border: 0;
		border-block-start: 1px solid var(--ms-border);
	}
	@media (max-width: 767px) {
		.d2 {
			font-size: 24px;
		}
		.d3 {
			font-size: 19px;
		}
		table {
			min-inline-size: 520px;
			font-size: 14px;
		}
		th,
		td {
			padding: 8px 10px;
		}
	}
	@media (forced-colors: active) {
		.table-scroll,
		blockquote {
			border-color: CanvasText;
		}
	}
</style>
