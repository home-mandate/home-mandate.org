<script lang="ts">
	import Playground from '$lib/components/playground/Playground.svelte';
	import PlaygroundNoScript from '$lib/components/playground/PlaygroundNoScript.svelte';
	import { playgroundTexts } from '$lib/content/pages/playground';
	import { scripts } from '$lib/generated/client';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const texts = playgroundTexts();
</script>

<svelte:head>
	<title>{m.playground_title()} – {m.site_name()}</title>
	<meta name="description" content={m.playground_intro()} />
	<script type="module" src={scripts.playground}></script>
</svelte:head>

<div class="wrap playground">
	<header class="intro">
		<h1>{m.playground_title()}</h1>
		<p class="lead"><span class="long">{m.playground_intro()}</span><span class="short">{m.playground_intro_short()}</span></p>
	</header>
	<PlaygroundNoScript example={data.examples.voice} {texts} />
	<Playground examples={data.examples} {texts} locale={getLocale()} version={data.version} />
</div>

<style>
	.playground {
		display: flex;
		flex-direction: column;
		gap: 28px;
		padding-block: clamp(28px, 4vw, 56px) clamp(56px, 6.7vw, 96px);
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.lead {
		max-inline-size: 40em;
	}
	.short {
		display: none;
	}
	@media (max-width: 767px) {
		.long {
			display: none;
		}
		.short {
			display: inline;
		}
	}
</style>
