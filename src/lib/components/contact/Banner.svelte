<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MailLink from './MailLink.svelte';
	import type { IconName } from '$lib/icons';

	// Result banner above the form (failed, rate limit, not accepted, error
	// summary). Hidden until the contact script shows it and moves focus to it.
	let {
		kind,
		tone,
		icon,
		title,
		body,
		mail = false,
		children
	}: { kind: string; tone: 'deny' | 'ask'; icon: IconName; title: string; body?: string; mail?: boolean; children?: Snippet } =
		$props();
</script>

<div class="banner {tone}" data-banner={kind} tabindex="-1" hidden>
	<Icon name={icon} size={22} stroke={1.9} />
	<div class="text">
		<strong>{title}</strong>
		{#if body}<span class="body">{body}</span>{/if}
		{#if mail}<MailLink size="small" />{/if}
		{#if children}{@render children()}{/if}
	</div>
</div>

<style>
	.banner {
		display: flex;
		gap: 14px;
		padding: 16px 18px;
		border: 1px solid;
		border-radius: 12px;
	}
	.banner[hidden] {
		display: none;
	}
	.banner > :global(svg) {
		margin-block-start: 2px;
	}
	.deny {
		border-color: var(--ms-deny-border);
		background: var(--ms-deny-bg);
	}
	.deny > :global(svg) {
		color: var(--ms-deny-fg);
	}
	.ask {
		border-color: var(--ms-ask-border);
		background: var(--ms-ask-bg);
	}
	.ask > :global(svg) {
		color: var(--ms-ask-fg);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-inline-size: 0;
	}
	strong {
		font-weight: 650;
	}
	.body {
		font-size: 16px;
	}
	@media (forced-colors: active) {
		.banner {
			border-color: CanvasText;
		}
	}
</style>
