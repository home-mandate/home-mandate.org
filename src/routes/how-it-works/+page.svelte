<script lang="ts">
	import BuildingBlocks from '$lib/components/how/BuildingBlocks.svelte';
	import GroundRules from '$lib/components/how/GroundRules.svelte';
	import HashChain from '$lib/components/how/HashChain.svelte';
	import MandateViews from '$lib/components/how/MandateViews.svelte';
	import PathDiagram from '$lib/components/how/PathDiagram.svelte';
	import { scripts } from '$lib/generated/client';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.how_title()} – {m.site_name()}</title>
	<meta name="description" content={m.how_intro()} />
	<script type="module" src={scripts.how}></script>
</svelte:head>

<header class="wrap intro">
	<h1>{m.how_title()}</h1>
	<p class="lead">{m.how_intro()}</p>
</header>
<BuildingBlocks />
<PathDiagram />
<MandateViews />
<GroundRules />
<HashChain chain={data.chain} />

<style>
	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(28px, 3.3vw, 48px);
	}
	.lead {
		max-inline-size: 40em;
	}
</style>
