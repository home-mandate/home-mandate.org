<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { ConformanceClass } from '$lib/content/implementations';
	import { m } from '$lib/paraglide/messages';

	// A conformance class of an implementation: "passed" only with a published
	// run, otherwise "declared". The state is in the text, not only in the look.
	let { id, passed, small = false }: { id: ConformanceClass; passed: boolean; small?: boolean } = $props();

	const status = $derived(passed ? m.implement_badge_passed() : m.implement_badge_declared());
</script>

<span class="badge mono" class:passed class:small title={status}>
	<Icon name={passed ? 'check' : 'clock'} size={11} stroke={3} />{id}<span class="visually-hidden"> ({status})</span>
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		border: 1px dashed var(--ms-border-strong);
		border-radius: 6px;
		color: var(--ms-text-muted);
		font-size: 12.5px;
		white-space: nowrap;
	}
	.badge.passed {
		border-style: solid;
		border-color: var(--ms-allow-border);
		color: var(--ms-allow-fg);
	}
	.badge.small {
		padding: 1px 7px;
		font-size: 12px;
	}
	@media (forced-colors: active) {
		.badge,
		.badge.passed {
			border-color: CanvasText;
		}
	}
</style>
