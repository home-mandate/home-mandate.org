<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import RelayErrorList from '#lib/components/relay/RelayErrorList.svelte';
	import RelayErrorsHead from '#lib/components/relay/RelayErrorsHead.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { data } = $props();
</script>

<!-- One page per problem type, so that every "type" URL answers; the list
     (/relay/errors/) is the indexed one. -->
<PageMeta title="{data.current.name} – {m.relay_errors_meta_title()} – {m.site_name()}" description={m.relay_errors_intro()} noindex />

<div class="wrap page">
	<RelayErrorsHead tag={data.tag} current={data.current} />
	<RelayErrorList errors={data.errors} current={data.current.name} />
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
	}
</style>
