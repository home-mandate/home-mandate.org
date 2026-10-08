<script lang="ts">
	import SpecBlocks from '../spec/SpecBlocks.svelte';
	import SpecInline from '../spec/SpecInline.svelte';
	import { pathIn } from '$lib/locale';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { ChangeKind, ReleaseNotes } from '$lib/spec/changelog';
	import { formatDate } from '$lib/spec/date';

	// Versions of the specification with their changes. The text is quoted
	// from the specification (English); badges only where the text names a kind.
	let { notes }: { notes: ReleaseNotes } = $props();

	const locale = $derived(getLocale());
	const kinds: Record<ChangeKind, () => string> = {
		added: m.changelog_kind_added,
		changed: m.changelog_kind_changed,
		fixed: m.changelog_kind_fixed,
		removed: m.changelog_kind_removed,
		incompatible: m.changelog_kind_incompatible,
		clarified: m.changelog_kind_clarified
	};
</script>

<div class="changelog">
	{#each notes.entries as entry (entry.id)}
		<article id={entry.id} aria-labelledby="{entry.id}-title">
			<div class="when">
				<h2 class="version" id="{entry.id}-title" lang="en">{entry.version}</h2>
				{#if entry.unreleased}
					<span class="date"
						>{m.changelog_as_of({ version: notes.tag })}{#if notes.date}<span aria-hidden="true"> · </span><time datetime={notes.date}
								>{formatDate(notes.date, locale)}</time
							>{/if}</span
					>
				{:else if entry.date}
					<time class="date" datetime={entry.date}>{formatDate(entry.date, locale)}</time>
				{/if}
				<a class="in-spec" href="{pathIn('/spec/v0/', locale)}#{entry.id}">{m.changelog_in_spec()}</a>
			</div>
			<div class="groups" lang="en">
				{#each entry.groups as group, g (g)}
					<section class="group">
						{#if group.kind || group.intro}
							<p class="intro">
								{#if group.kind}<span class="kind {group.kind}" lang={locale}>{kinds[group.kind]()}</span>{/if}
								{#if group.intro}<span><SpecInline nodes={group.intro} /></span>{/if}
							</p>
						{/if}
						{#if group.items.length > 0}
							<ul>
								{#each group.items as item, n (n)}
									<li><SpecBlocks blocks={item.blocks} prefix="cl-{entry.id}-{g}-{n}" /></li>
								{/each}
							</ul>
						{/if}
					</section>
				{/each}
			</div>
		</article>
	{/each}
</div>

<style>
	.changelog {
		display: flex;
		flex-direction: column;
		border-block-start: 1px solid var(--ms-border);
	}
	article {
		display: grid;
		grid-template-columns: 160px minmax(0, 1fr);
		gap: 12px 24px;
		padding-block: 24px;
		border-block-end: 1px solid var(--ms-border);
	}
	.when {
		display: flex;
		flex-direction: column;
		gap: 6px;
		align-items: flex-start;
	}
	.version {
		font: 600 18px var(--ms-font-mono);
		letter-spacing: 0;
		overflow-wrap: anywhere;
	}
	.date {
		font-size: 14.5px;
		color: var(--ms-text-muted);
	}
	.in-spec {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		font-size: 14.5px;
	}
	.groups {
		display: flex;
		flex-direction: column;
		gap: 20px;
		min-inline-size: 0;
		font-size: 16px;
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.intro {
		display: flex;
		gap: 10px;
		align-items: baseline;
	}
	.kind {
		flex: none;
		min-inline-size: 72px;
		padding: 1px 8px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		font: 12.5px var(--ms-font-mono);
		text-align: center;
	}
	.incompatible {
		border-color: var(--ms-ask-border);
		background: var(--ms-ask-bg);
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding-inline-start: 1.25em;
	}
	@media (max-width: 767px) {
		article {
			grid-template-columns: minmax(0, 1fr);
		}
		.when {
			flex-direction: row;
			flex-wrap: wrap;
			align-items: baseline;
			column-gap: 12px;
		}
		.intro {
			display: block;
		}
		.kind {
			display: inline-block;
			margin-inline-end: 8px;
		}
	}
	@media (forced-colors: active) {
		.kind {
			border-color: CanvasText;
		}
	}
</style>
