<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	// "For techies" box: closed by default, a native <details> (no JavaScript needed).
	let { title, id, children }: { title: string; id?: string; children: Snippet } = $props();
</script>

<details class="tech" {id}>
	<summary><Icon name="code" /><span>{title}</span><Icon name="chevron" size={18} stroke={2} /></summary>
	<div class="content">{@render children()}</div>
</details>

<style>
	.tech {
		border: 1px solid var(--ms-border-strong);
		border-radius: 12px;
		background: var(--ms-surface);
	}
	summary {
		display: flex;
		align-items: center;
		gap: 10px;
		min-block-size: 52px;
		padding-inline: 16px;
		font-weight: 650;
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary span {
		flex: 1;
	}
	[open] summary > :global(svg:last-child) {
		transform: rotate(180deg);
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 16px 16px 46px;
		font-size: 16px;
		color: var(--ms-text-muted);
	}
</style>
