<script lang="ts">
	import Callout from '$lib/components/Callout.svelte';
	import Decision from '$lib/components/Decision.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { describeMandate } from '../../../client/playground/describe.ts';
	import { agentName, rulesOf, type JsonObject } from '../../../client/playground/model.ts';
	import type { Texts } from '../../../client/playground/texts.ts';

	// Without JavaScript: the notice, and the voice assistant example in plain language.
	let { example, texts }: { example: string; texts: Texts } = $props();

	const doc = $derived(JSON.parse(example) as JsonObject);
	const rules = $derived(describeMandate({ texts, locale: getLocale() }, agentName(doc, ''), rulesOf(doc)));
	const decision = (value: string) => (value === 'allow' || value === 'ask' ? value : 'deny');
</script>

<div class="no-js-only nojs">
	<Callout title={m.playground_nojs_title()}><RichText text={m.playground_nojs_body()} /></Callout>
	<section class="example" aria-labelledby="pg-nojs-example">
		<h2 id="pg-nojs-example">{m.playground_nojs_example()}</h2>
		<p class="muted">{m.playground_nojs_rules({ id: String(doc.id) })}</p>
		<ul class="rules">
			{#each rules as rule (rule.id)}
				<li>
					<Decision value={decision(rule.decision)} />
					<div>
						{#each rule.sentences as sentence, i (i)}<p>{sentence}</p>{/each}
						<span class="mono id">{rule.id}</span>
					</div>
				</li>
			{/each}
			<li class="default"><Decision value="deny" /><p>{m.playground_default_note()}</p></li>
		</ul>
	</section>
</div>

<style>
	.nojs {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-inline-size: 860px;
	}
	.example {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.example h2 {
		font-size: 22px;
	}
	.rules {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.rules li {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px 18px;
		border: 1px solid var(--ms-border);
		border-radius: var(--ms-radius);
		background: var(--ms-surface);
	}
	.rules li > :global(.chip) {
		inline-size: 7.5em;
		justify-content: flex-start;
	}
	.id {
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	.default {
		color: var(--ms-text-muted);
	}
	@media (max-width: 767px) {
		.rules li {
			flex-direction: column;
		}
	}
</style>
