<script lang="ts">
	import Icon from '../Icon.svelte';
	import SpecInline from './SpecInline.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { Inline } from '$lib/spec/types';

	// Inline nodes of the specification (recursive). Text is always text:
	// nothing here is inserted as HTML.
	let { nodes }: { nodes: Inline[] } = $props();
</script>

{#each nodes as node, i (i)}{#if node.type === 'text'}{node.text}{:else if node.type === 'keyword'}<strong class="kw"
			>{node.text}</strong
		>{:else if node.type === 'code'}<code>{node.text}</code>{:else if node.type === 'strong'}<strong
			><SpecInline nodes={node.children} /></strong
		>{:else if node.type === 'em'}<em><SpecInline nodes={node.children} /></em>{:else if node.type === 'del'}<del
			><SpecInline nodes={node.children} /></del
		>{:else if node.type === 'br'}<br />{:else if node.type === 'link'}<a href={node.href}
			><SpecInline nodes={node.children} />{#if node.external}<Icon name="external" size={14} /><span
					class="visually-hidden"
					lang={getLocale()}>{m.common_external()}</span
				>{/if}</a
		>{/if}{/each}

<style>
	.kw {
		font-weight: 700;
		font-size: 0.9em;
		letter-spacing: 0.04em;
	}
	a :global(svg) {
		margin-inline-start: 3px;
		vertical-align: -1px;
	}
</style>
