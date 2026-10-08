<script lang="ts">
	import Icon from './Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	// Three radio buttons; site.ts applies and remembers the choice. Hidden
	// without JavaScript: then the site simply follows the system setting.
	let { group, variant = 'compact' }: { group: string; variant?: 'compact' | 'segments' } = $props();

	const options = [
		{ value: 'light', icon: 'sun', label: m.common_theme_light },
		{ value: 'dark', icon: 'moon', label: m.common_theme_dark },
		{ value: 'system', icon: 'system', label: m.common_theme_system }
	] as const;
</script>

<fieldset class="theme js-only {variant}">
	<legend class={variant === 'compact' ? 'visually-hidden' : 'legend'}>{m.common_theme()}</legend>
	<div class="options">
		{#each options as option (option.value)}
			<label title={option.label()}>
				<input type="radio" name={group} value={option.value} checked={option.value === 'system'} data-theme-choice />
				<Icon name={option.icon} size={variant === 'compact' ? 17 : 18} />
				<span class={variant === 'compact' ? 'visually-hidden' : ''}>{option.label()}</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
	}
	.legend {
		padding: 0;
		margin-block-end: 10px;
		font-size: 14px;
		font-weight: 650;
		color: var(--ms-text-muted);
	}
	.options {
		display: flex;
		gap: 2px;
		padding: 3px;
		border: 1px solid var(--ms-border);
		border-radius: var(--ms-radius);
	}
	label {
		position: relative;
		display: grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: 7px;
		color: var(--ms-text-muted);
		cursor: pointer;
	}
	label:hover {
		color: var(--ms-text);
	}
	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	label:has(input:checked) {
		background: var(--ms-surface-2);
		color: var(--ms-text);
	}
	label:has(input:focus-visible) {
		outline: 2px solid var(--ms-focus);
		outline-offset: 1px;
	}
	.segments .options {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 4px;
		padding: 4px;
		border-radius: 12px;
	}
	.segments label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		inline-size: auto;
		block-size: 56px;
		border-radius: 9px;
		font-size: 14px;
	}
	.segments label:has(input:checked) {
		font-weight: 600;
	}
	@media (forced-colors: active) {
		label:has(input:checked) {
			outline: 2px solid CanvasText;
		}
	}
</style>
