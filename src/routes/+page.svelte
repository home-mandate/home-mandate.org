<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { specUrl } from '$lib/site';

	const decisions = [
		{ key: 'allow', title: m.home_allow_title(), text: m.home_allow_text() },
		{ key: 'ask', title: m.home_ask_title(), text: m.home_ask_text() },
		{ key: 'deny', title: m.home_deny_title(), text: m.home_deny_text() }
	];
</script>

<svelte:head>
	<title>{m.site_name()} – {m.home_title()}</title>
</svelte:head>

<section class="hero">
	<h1>{m.home_title()}</h1>
	<p class="lead">{m.home_lead()}</p>
	<p>{m.home_construction()}</p>
	<p class="actions">
		<a href={specUrl('SPEC-v0.md')}>{m.home_cta_spec()}</a>
		<a href={specUrl('README.md', 'testing-an-implementation')}>{m.home_cta_conformance()}</a>
	</p>
</section>

<section aria-labelledby="decisions">
	<h2 id="decisions">{m.home_decisions_title()}</h2>
	<ul class="decisions">
		{#each decisions as d (d.key)}
			<li class={d.key}>
				<strong><code>{d.title}</code></strong>
				<span>{d.text}</span>
			</li>
		{/each}
	</ul>
	<p>{m.home_rule()}</p>
</section>

<style>
	.hero {
		max-inline-size: var(--ms-measure);
	}
	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-block: 1rem;
	}
	.lead {
		font-size: 1.25rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
	}
	.decisions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--ms-space);
		padding: 0;
		list-style: none;
	}
	.decisions li {
		display: grid;
		gap: 0.5rem;
		padding: var(--ms-space);
		border: 1px solid var(--ms-border);
		border-inline-start-width: 6px;
		border-radius: var(--ms-radius);
	}
	.allow {
		border-inline-start-color: var(--ms-allow);
	}
	.ask {
		border-inline-start-color: var(--ms-ask);
	}
	.deny {
		border-inline-start-color: var(--ms-deny);
	}
</style>
