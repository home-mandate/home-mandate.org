<script lang="ts">
	import Icon from './Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	export type DecisionValue = 'allow' | 'ask' | 'deny';

	// The one way to show a decision: symbol + word + colour, never colour alone.
	// size "icon" shows only the symbol, with the word as its accessible name.
	let { value, size = 'sm' }: { value: DecisionValue; size?: 'sm' | 'lg' | 'xl' | 'icon' } = $props();

	const words = { allow: m.common_allow, ask: m.common_ask, deny: m.common_deny };
	const icons = { sm: 16, lg: 20, xl: 26, icon: 14 };
	const word = $derived(words[value]());
</script>

{#if size === 'icon'}
	<span class="chip icon {value}"><Icon name={value} size={icons.icon} stroke={2.6} label={word} /></span>
{:else}
	<span class="chip {size} {value}"><Icon name={value} size={icons[size]} stroke={2.4} />{word}</span>
{/if}

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		inline-size: fit-content;
		border: 1px solid;
		border-radius: var(--ms-radius-pill);
		font-weight: 600;
		line-height: 1.2;
		white-space: nowrap;
	}
	.sm {
		padding-block: 4px;
		padding-inline: 8px 12px;
		font-size: 14px;
	}
	.lg {
		gap: 8px;
		padding-block: 7px;
		padding-inline: 12px 16px;
		font-size: 17px;
		font-weight: 650;
	}
	.xl {
		gap: 10px;
		padding-block: 10px;
		padding-inline: 16px 22px;
		border-width: 1.5px;
		font-size: 24px;
		font-weight: 650;
	}
	.icon {
		display: inline-grid;
		place-items: center;
		inline-size: 24px;
		block-size: 24px;
	}
	.allow {
		color: var(--ms-allow-fg);
		background: var(--ms-allow-bg);
		border-color: var(--ms-allow-border);
	}
	.ask {
		color: var(--ms-ask-fg);
		background: var(--ms-ask-bg);
		border-color: var(--ms-ask-border);
	}
	.deny {
		color: var(--ms-deny-fg);
		background: var(--ms-deny-bg);
		border-color: var(--ms-deny-border);
	}
	@media (forced-colors: active) {
		.chip {
			border-color: CanvasText;
		}
	}
</style>
