<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { specUrl } from '$lib/site';

	let {
		name,
		version,
		schema,
		section
	}: { name: string; version: string; schema?: string; section: string } = $props();
</script>

<svelte:head>
	<title>{m.ident_title({ name, version })} – mandate-spec</title>
</svelte:head>

<article>
	<h1>{m.ident_title({ name, version })}</h1>
	<p>{m.ident_body({ name, version })}</p>
	<ul>
		{#if schema}
			<li><a href={`/${schema}`} type="application/schema+json">{m.ident_schema()}</a></li>
		{/if}
		<li><a href={specUrl('SPEC-v0.md', section)}>{m.ident_spec()}</a></li>
	</ul>
	<p class="note">{m.lang_spec_english()}</p>
</article>

<style>
	article {
		max-inline-size: var(--ms-measure);
	}
	.note {
		color: var(--ms-muted);
	}
</style>
