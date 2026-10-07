<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from '$lib/icons';

	// Notice box. Tones: info (neutral), tip (allow colours), warn (ask colours),
	// critical (deny colours, octagon icon). The icon is decoration; the title
	// carries the meaning.
	let {
		tone = 'info',
		icon,
		title,
		children
	}: { tone?: 'info' | 'tip' | 'warn' | 'critical'; icon?: IconName; title: string; children?: Snippet } = $props();

	const defaults: Record<string, IconName> = { info: 'info', tip: 'light', warn: 'warning', critical: 'critical' };
</script>

<div class="callout {tone}">
	<Icon name={icon ?? defaults[tone] ?? 'info'} size={24} />
	<div class="body">
		<strong>{title}</strong>
		{#if children}<div class="text">{@render children()}</div>{/if}
	</div>
</div>

<style>
	.callout {
		display: flex;
		gap: 16px;
		padding: 20px 24px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.callout > :global(svg) {
		color: var(--ms-accent);
		margin-block-start: 1px;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-inline-size: 0;
	}
	strong {
		font-size: 19px;
		font-weight: 650;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 16px;
	}
	.tip {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
	}
	.tip > :global(svg) {
		color: var(--ms-allow-fg);
	}
	.warn {
		border-color: var(--ms-ask-border);
		background: var(--ms-ask-bg);
	}
	.warn > :global(svg) {
		color: var(--ms-ask-fg);
	}
	.critical {
		border-color: var(--ms-deny-border);
		background: var(--ms-deny-bg);
	}
	.critical > :global(svg) {
		color: var(--ms-deny-fg);
	}
	@media (max-width: 767px) {
		.callout {
			padding: 16px;
			gap: 12px;
		}
		strong {
			font-size: 17px;
		}
	}
	@media (forced-colors: active) {
		.callout {
			border-color: CanvasText;
		}
	}
</style>
