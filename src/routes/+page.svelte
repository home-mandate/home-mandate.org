<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import ImplementationList from '$lib/components/home/ImplementationList.svelte';
	import MandateCard from '$lib/components/home/MandateCard.svelte';
	import OpenFacts from '$lib/components/home/OpenFacts.svelte';
	import Scenario from '$lib/components/home/Scenario.svelte';
	import StartCards from '$lib/components/home/StartCards.svelte';
	import ThreeDecisions from '$lib/components/home/ThreeDecisions.svelte';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	const locale = $derived(getLocale());
</script>

<svelte:head>
	<title>{m.site_name()} – {m.home_title()}</title>
</svelte:head>

<section class="hero" aria-labelledby="home-title">
	<div class="wrap grid">
		<div class="intro">
			<h1 id="home-title">{m.home_title()}</h1>
			<p class="lead">{m.home_lead()}</p>
			<div class="actions">
				<a class="btn btn-primary" href={pathIn('/playground/', locale)}
					>{m.home_cta_playground()}<Icon name="arrow" size={18} stroke={2} /></a
				>
				<a class="btn btn-secondary" href={pathIn('/how-it-works/', locale)}>{m.home_cta_how()}</a>
			</div>
			<p class="meta">{m.home_meta()}</p>
		</div>
		<MandateCard />
	</div>
</section>

<ThreeDecisions />
<Scenario />
<StartCards />
<OpenFacts />
<ImplementationList />

<style>
	.hero {
		padding-block: clamp(40px, 6.7vw, 96px) clamp(48px, 7.2vw, 104px);
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(40px, 5.6vw, 80px);
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 28px;
	}
	h1 {
		font-size: var(--h1-home);
		line-height: 1.08;
		letter-spacing: -0.025em;
	}
	.lead {
		max-inline-size: 34em;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-block-start: 8px;
	}
	.meta {
		margin-block-start: 4px;
		font-size: 14px;
		color: var(--ms-text-muted);
	}

	@media (max-width: 1023.98px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.grid > :global(figure) {
			max-inline-size: 600px;
		}
	}
	@media (max-width: 767.98px) {
		.grid {
			gap: 36px;
		}
		.intro {
			gap: 20px;
		}
		h1 {
			line-height: 1.12;
			letter-spacing: -0.02em;
		}
		.actions {
			flex-direction: column;
			gap: 10px;
			margin-block-start: 4px;
		}
		.meta {
			display: none;
		}
	}
</style>
