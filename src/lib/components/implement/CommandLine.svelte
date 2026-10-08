<script lang="ts">
	import Icon from '../Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	// One shell command with a label and a copy button (the button needs
	// JavaScript, the command is always readable and selectable).
	let { label, command, id }: { label: string; command: string; id: string } = $props();
</script>

<div class="command">
	<span class="label" id="{id}-label">{label}</span>
	<div class="line">
		<!-- Scrollable code must be reachable by keyboard (WCAG 2.1.1). -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<pre tabindex="0" aria-labelledby="{id}-label"><span class="prompt" aria-hidden="true">$ </span><code {id}>{command}</code></pre>
		<div class="tools js-only">
			<button type="button" class="copy" data-copy-target="#{id}" aria-describedby="{id}-label">
				<span class="idle"><Icon name="copy" size={15} stroke={2} />{m.common_copy()}</span>
				<span class="done"><Icon name="check" size={15} stroke={2.4} />{m.common_copied()}</span>
				<span class="failed"><Icon name="warning" size={15} stroke={2.2} />{m.common_copy_failed()}</span>
			</button>
			<span class="visually-hidden" aria-live="polite" data-copy-status={m.common_copied()} data-copy-failed-status={m.common_copy_failed_status()}></span>
		</div>
	</div>
</div>

<style>
	.command {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-inline-size: 0;
	}
	.label {
		font-size: 13.5px;
		color: var(--ms-text-muted);
	}
	.line {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-block: 6px;
		padding-inline: 16px 6px;
		border: 1px solid var(--ms-border);
		border-radius: var(--ms-radius);
		background: var(--ms-surface-2);
		min-inline-size: 0;
	}
	pre {
		flex: 1;
		min-inline-size: 0;
		margin: 0;
		padding-block: 8px;
		overflow-x: auto;
		font-size: 14.5px;
		line-height: 1.5;
		white-space: pre;
	}
	.prompt {
		color: var(--ms-text-muted);
		user-select: none;
	}
	.copy {
		display: inline-flex;
		align-items: center;
		min-block-size: 36px;
		padding-inline: 12px;
		border: 1px solid var(--ms-border-strong);
		border-radius: var(--ms-radius-sm);
		background: var(--ms-surface);
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}
	.copy span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.copy .done,
	.copy .failed,
	:global(.command .copy[data-copied]) .idle,
	:global(.command .copy[data-copy-failed]) .idle {
		display: none;
	}
	:global(.command .copy[data-copied]) .done,
	:global(.command .copy[data-copy-failed]) .failed {
		display: inline-flex;
	}
	:global(.command .copy[data-copied]) {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
		color: var(--ms-allow-fg);
	}
	:global(.command .copy[data-copy-failed]) {
		border-color: var(--ms-deny-border);
		background: var(--ms-deny-bg);
		color: var(--ms-deny-fg);
	}
	@media (max-width: 767px) {
		.line {
			flex-direction: column;
			align-items: stretch;
			gap: 0;
			padding: 0;
			overflow: hidden;
		}
		pre {
			padding: 12px;
			font-size: 13px;
		}
		.tools {
			display: flex;
		}
		.copy {
			flex: 1;
			justify-content: center;
			min-block-size: 44px;
			border: 0;
			border-block-start: 1px solid var(--ms-border);
			border-radius: 0;
			font-size: 14.5px;
		}
	}
	@media (forced-colors: active) {
		.copy {
			border: 1px solid ButtonText;
		}
	}
</style>
