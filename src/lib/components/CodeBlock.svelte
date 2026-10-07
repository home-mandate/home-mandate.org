<script lang="ts">
	import Icon from './Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	// Code with an optional file name and a copy button (shown with JavaScript only).
	let { code, file, id }: { code: string; file?: string; id: string } = $props();
</script>

<figure class="code">
	{#if file}
		<figcaption><span class="mono">{file}</span></figcaption>
	{/if}
	<div class="tools js-only">
		<button type="button" class="copy" data-copy-target="#{id}">
			<span class="idle"><Icon name="copy" size={16} />{m.common_copy()}</span>
			<span class="done"><Icon name="check" size={16} stroke={2.4} />{m.common_copied()}</span>
		</button>
		<span class="visually-hidden" aria-live="polite" data-copy-status={m.common_copied()}></span>
	</div>
	<!-- Scrollable code must be reachable by keyboard (WCAG 2.1.1). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre tabindex="0"><code {id}>{code}</code></pre>
</figure>

<style>
	.code {
		position: relative;
		margin: 0;
		border: 1px solid var(--ms-border);
		border-radius: 12px;
		background: var(--ms-surface-2);
		overflow: hidden;
	}
	figcaption {
		padding: 10px 16px;
		border-block-end: 1px solid var(--ms-border);
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	.tools {
		position: absolute;
		inset-block-start: 6px;
		inset-inline-end: 6px;
	}
	.copy {
		display: inline-flex;
		align-items: center;
		min-block-size: 32px;
		padding-inline: 10px;
		border: 1px solid var(--ms-border-strong);
		border-radius: var(--ms-radius-sm);
		background: var(--ms-surface);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}
	.copy span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.copy .done,
	:global(.copy[data-copied]) .idle {
		display: none;
	}
	:global(.copy[data-copied]) .done {
		display: inline-flex;
	}
	:global(.copy[data-copied]) {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
		color: var(--ms-allow-fg);
	}
	pre {
		margin: 0;
		padding: 16px;
		overflow-x: auto;
		font-size: 14px;
		line-height: 1.6;
	}
	figcaption + .tools {
		inset-block-start: 4px;
	}
</style>
