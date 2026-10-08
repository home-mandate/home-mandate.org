<script lang="ts">
	import Icon from '../Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	// Imported releases of the specification. Every entry is a plain link (works
	// without JavaScript, nothing is stored). With a single release there is
	// nothing to choose: it is shown as the current version.
	interface Option {
		tag: string;
		latest: boolean;
		href: string;
	}
	let { versions, current, compact = false }: { versions: Option[]; current: string; compact?: boolean } = $props();

	const note = (latest: boolean) => (latest ? `${m.spec_latest()} · ${m.spec_draft()}` : m.spec_draft());
	const active = $derived(versions.find((v) => v.tag === current));
</script>

{#if versions.length > 1}
	<details class="version" class:compact data-popover="version">
		<summary>
			<span class="visually-hidden">{m.spec_version()}:</span>
			<span class="tag">{current}</span>
			{#if !compact && active}<span class="note">{note(active.latest)}</span>{/if}
			<Icon name="chevron" size={14} stroke={2} />
		</summary>
		<ul class="panel">
			{#each versions as v (v.tag)}
				<li>
					<a href={v.href} aria-current={v.tag === current ? 'page' : undefined}>
						<span class="tag">{v.tag}</span><span class="note">{note(v.latest)}</span>
						{#if v.tag === current}<Icon name="check" size={16} stroke={2.4} />{/if}
					</a>
				</li>
			{/each}
		</ul>
	</details>
{:else}
	<p class="version static" class:compact>
		<span class="visually-hidden">{m.spec_version()}:</span>
		<span class="tag">{current}</span>
		{#if !compact && active}<span class="note">{note(active.latest)}</span>{/if}
	</p>
{/if}

<style>
	.version {
		position: relative;
		flex: none;
		margin: 0;
	}
	summary,
	.static {
		display: flex;
		align-items: center;
		gap: 8px;
		block-size: 40px;
		padding-inline: 12px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 8px;
		background: var(--ms-bg);
		font-size: 14.5px;
		white-space: nowrap;
	}
	summary {
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.static {
		border-color: var(--ms-border);
	}
	.tag {
		font-family: var(--ms-font-mono);
	}
	.note {
		color: var(--ms-text-muted);
	}
	.panel {
		position: absolute;
		inset-inline-end: 0;
		inset-block-start: calc(100% + 6px);
		z-index: 5;
		display: flex;
		flex-direction: column;
		inline-size: max-content;
		min-inline-size: 260px;
		margin: 0;
		padding: 6px;
		list-style: none;
		border: 1px solid var(--ms-border-strong);
		border-radius: 12px;
		background: var(--ms-surface);
		box-shadow: var(--ms-shadow-2);
	}
	.panel a {
		display: flex;
		align-items: center;
		gap: 10px;
		min-block-size: 44px;
		padding-inline: 10px;
		border-radius: 8px;
		color: var(--ms-text);
		text-decoration: none;
		font-size: 14.5px;
	}
	.panel a:hover,
	.panel a[aria-current] {
		background: var(--ms-surface-2);
	}
	.panel .tag {
		font-weight: 600;
	}
	.panel .note {
		flex: 1;
	}
	.compact summary,
	.compact.static {
		block-size: 48px;
		padding-inline: 10px;
		border-color: var(--ms-border);
		border-radius: 10px;
		background: transparent;
		font-size: 14px;
	}
	@media (forced-colors: active) {
		summary,
		.static,
		.panel {
			border-color: CanvasText;
		}
	}
</style>
