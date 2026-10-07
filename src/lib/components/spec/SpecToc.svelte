<script lang="ts">
	import type { TocEntry } from '$lib/spec/types';

	// Table of contents. The page script (src/client/pages/spec.ts) marks the
	// section in view with aria-current="location"; without JavaScript it is a
	// plain list of links.
	let { toc, label, variant }: { toc: TocEntry[]; label: string; variant: 'side' | 'sheet' } = $props();
</script>

<nav class="toc {variant}" aria-label={label} data-spec-toc>
	<ul lang="en">
		{#each toc as entry (entry.id)}
			<li class:sub={entry.depth > 2}>
				<a href="#{entry.id}" data-toc-target={entry.id}
					><span class="num">{entry.number}</span><span class="text">{entry.text}</span></a
				>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 1px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		display: flex;
		gap: 10px;
		color: var(--ms-text);
		text-decoration: none;
		line-height: 1.35;
	}
	a:hover {
		background: var(--ms-surface-2);
	}
	.num {
		flex: none;
		min-inline-size: 28px;
		font-family: var(--ms-font-mono);
		font-size: 13px;
		color: var(--ms-text-muted);
		padding-block-start: 2px;
	}
	.sub a {
		color: var(--ms-text-muted);
	}
	a:global([aria-current]) {
		color: var(--ms-text);
		font-weight: 650;
	}

	/* Desktop: a column with a 1 px line; the current entry gets a 2 px bar. */
	.side ul {
		border-inline-start: 1px solid var(--ms-border);
	}
	.side a {
		margin-inline-start: -1px;
		padding-block: 6px;
		padding-inline: 14px 12px;
		border-inline-start: 2px solid transparent;
		font-size: 15.5px;
		font-weight: 500;
	}
	.side .sub a {
		padding-inline-start: 28px;
		font-size: 14.5px;
		font-weight: 400;
	}
	.side a:global([aria-current]) {
		border-inline-start-color: var(--ms-text);
		font-weight: 650;
	}

	/* Phone: rows of at least 44 px inside the sticky disclosure. */
	.sheet a {
		align-items: center;
		min-block-size: 44px;
		padding-inline: 8px;
		border-radius: 8px;
		font-size: 15px;
	}
	.sheet .num {
		min-inline-size: 30px;
		padding-block-start: 0;
	}
	.sheet .sub a {
		padding-inline-start: 24px;
	}
	.sheet a:global([aria-current]) {
		background: var(--ms-surface-2);
	}
	@media (forced-colors: active) {
		.side a:global([aria-current]) {
			border-inline-start-color: Highlight;
		}
	}
</style>
