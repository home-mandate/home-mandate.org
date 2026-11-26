<script lang="ts">
	import RichText from '../RichText.svelte';
	import { pathIn } from '#lib/locale.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { RelayErrorView } from '#lib/relay/errors.ts';

	// Heading of /relay/errors/ and of the page of one problem type: the URL as
	// eyebrow, what it is, and where the specification defines it.
	let { tag, current }: { tag: string; current?: RelayErrorView } = $props();

	const locale = $derived(getLocale());
	const url = $derived(`https://home-mandate.org/relay/errors/${current?.name ?? ''}`);
</script>

<header class="intro">
	<span class="eyebrow-mono mono">{url}</span>
	<h1>{current ? m.relay_errors_one_title({ name: current.name }) : m.relay_errors_title()}</h1>
	<p class="lead">{m.relay_errors_intro()}</p>
	<p class="muted"><RichText text={m.relay_errors_source({ version: tag })} /></p>
	{#if current}<a class="text-link" href={pathIn('/relay/errors/', locale)}>{m.relay_errors_all()} <span aria-hidden="true">→</span></a>{/if}
</header>

<style>
	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-inline-size: 1000px;
	}
	.lead {
		max-inline-size: 40em;
	}
	.eyebrow-mono {
		font-size: 13.5px;
		color: var(--ms-text-muted);
		overflow-wrap: anywhere;
	}
	.text-link {
		align-self: flex-start;
		min-block-size: 44px;
	}
</style>
