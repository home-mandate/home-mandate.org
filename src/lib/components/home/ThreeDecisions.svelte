<script lang="ts">
	import Decision from '$lib/components/Decision.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { IconName } from '$lib/icons';
	import type { Tone } from '$lib/content/types';
	import { m } from '$lib/paraglide/messages';

	const cards: { value: Tone; quote: string; body: string; icon: IconName; example: string }[] = [
		{ value: 'allow', quote: m.home_allow_quote(), body: m.home_allow_body(), icon: 'light', example: m.home_allow_example() },
		{ value: 'ask', quote: m.home_ask_quote(), body: m.home_ask_body(), icon: 'lock', example: m.home_ask_example() },
		{ value: 'deny', quote: m.home_deny_quote(), body: m.home_deny_body(), icon: 'alarm', example: m.home_deny_example() }
	];
</script>

<section class="section decisions" aria-labelledby="decisions-title">
	<div class="wrap">
		<div class="section-head">
			<h2 id="decisions-title">{m.home_decisions_title()}</h2>
			<p class="lead">{m.home_decisions_lead()}</p>
		</div>
		<ul class="cards">
			{#each cards as card (card.value)}
				<li class="card" data-decision={card.value}>
					<div class="top">
						<h3><Decision value={card.value} size="lg" /></h3>
						<p class="quote">{card.quote}</p>
					</div>
					<p class="body">{card.body}</p>
					<p class="example"><Icon name={card.icon} />{card.example}</p>
				</li>
			{/each}
		</ul>
		<p class="rule">
			<Icon name="household" />
			<span><strong>{m.home_rule_lead()}</strong> {m.home_rule_body()}</span>
		</p>
	</div>
</section>

<style>
	.decisions {
		border-block-start: 1px solid var(--ms-border);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 32px;
		background: var(--ms-surface);
		border: 1px solid var(--ms-border);
		border-radius: 16px;
	}
	.top {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	h3 {
		display: flex;
		font-size: inherit;
	}
	.quote {
		font-size: 26px;
		font-weight: 650;
		line-height: 1.3;
		letter-spacing: -0.01em;
	}
	.body {
		color: var(--ms-text-muted);
	}
	.example {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-block-start: auto;
		padding-block-start: 18px;
		border-block-start: 1px solid var(--ms-border);
		font-size: 15px;
	}
	.rule {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-block-start: 28px;
		padding-block: 18px;
		padding-inline: 24px;
		border-radius: 12px;
		background: var(--ms-surface-2);
		font-size: 16px;
	}
	strong {
		font-weight: 650;
	}

	@media (max-width: 1023.98px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767.98px) {
		.cards {
			grid-template-columns: minmax(0, 1fr);
			gap: 16px;
		}
		.card {
			gap: 12px;
			padding: 20px;
			border-radius: 14px;
		}
		.top {
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
		}
		.top :global(.chip) {
			gap: 7px;
			padding-block: 5px;
			padding-inline: 10px 14px;
			font-size: 16px;
		}
		.top :global(.chip svg) {
			inline-size: 18px;
			block-size: 18px;
		}
		.quote {
			font-size: 20px;
		}
		.body {
			font-size: 16px;
		}
		.example {
			padding-block-start: 12px;
		}
		.rule {
			margin-block-start: 16px;
			padding: 16px;
			font-size: 15.5px;
		}
		.rule > :global(svg) {
			display: none;
		}
	}
	@media (forced-colors: active) {
		.card {
			border-color: CanvasText;
		}
	}
</style>
