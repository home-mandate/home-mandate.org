<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	// Error text at a field, filled by the contact script after the first
	// submit. Empty while hidden, so aria-describedby adds nothing.
	let { id, indent = false }: { id: string; indent?: boolean } = $props();
</script>

<p class={['field-error', { indent }]} {id} hidden><Icon name="warn" size={17} stroke={2} /><span data-error-text></span></p>

<style>
	.field-error {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--ms-deny-fg);
	}
	.field-error[hidden] {
		display: none;
	}
	.indent {
		padding-inline-start: 38px;
	}
</style>
