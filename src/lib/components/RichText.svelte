<script lang="ts">
	import Icon from './Icon.svelte';
	import { localHref } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { segments } from '$lib/rich';

	// Text with [inline](/links/); internal paths get the language prefix.
	let { text }: { text: string } = $props();

	const locale = $derived(getLocale());
	const href = (target: string) => localHref(target, locale);
</script>

{#each segments(text) as segment, i (i)}{#if 'href' in segment}<a href={href(segment.href)}
			>{segment.text}{#if segment.external}<Icon name="external" size={14} /><span class="visually-hidden"
					>{m.common_external()}</span
				>{/if}</a
		>{:else}{segment.text}{/if}{/each}

<style>
	a :global(svg) {
		margin-inline-start: 3px;
		vertical-align: -1px;
	}
</style>
