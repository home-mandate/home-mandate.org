<script lang="ts">
	import PageMeta from '$lib/components/PageMeta.svelte';
	import BuildingBlocks from '$lib/components/how/BuildingBlocks.svelte';
	import GroundRules from '$lib/components/how/GroundRules.svelte';
	import HashChain from '$lib/components/how/HashChain.svelte';
	import MandateViews from '$lib/components/how/MandateViews.svelte';
	import PathDiagram from '$lib/components/how/PathDiagram.svelte';
	import TextBlocks from '$lib/components/TextBlocks.svelte';
	import type { Block } from '$lib/content/types';
	import { scripts } from '$lib/generated/client';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();

	// Where to go next: try it, or read the rules and the log in the specification.
	const readOn: Block[] = [
		{ h2: 'how_more_title', id: 'read-on' },
		{
			cards: [
				{ icon: 'play', title: 'how_more_play_title', body: 'how_more_play_body', link: 'how_more_play_link', href: '/playground/' },
				{ icon: 'spec', title: 'how_more_rules_title', body: 'how_more_rules_body', link: 'how_more_rules_link', href: '/spec/v0/#4-evaluation-rule' },
				{ icon: 'log', title: 'how_more_log_title', body: 'how_more_log_body', link: 'how_more_log_link', href: '/spec/v0/#9-audit-log' }
			]
		}
	];
</script>

<PageMeta title="{m.how_meta_title()} – {m.site_name()}" description={m.how_meta_description()} />

<svelte:head>
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
<section class="wrap read-on"><TextBlocks blocks={readOn} /></section>

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
	.read-on {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
	}
</style>
