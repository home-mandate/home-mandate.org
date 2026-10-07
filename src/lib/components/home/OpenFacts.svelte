<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	const facts = [
		{ term: m.home_fact_text(), value: m.home_fact_text_value() },
		{ term: m.home_fact_code(), value: m.home_fact_code_value() },
		{ term: m.home_fact_vendors(), value: m.home_fact_vendors_value() },
		{ term: m.home_fact_conformance(), value: m.home_fact_conformance_value() }
	];
</script>

<section class="open" aria-labelledby="open-title">
	<div class="wrap grid">
		<div class="text">
			<h2 id="open-title">{m.home_open_title()}</h2>
			<p class="lead">{m.home_open_body()}</p>
		</div>
		<dl>
			{#each facts as fact (fact.term)}
				<div>
					<dt>{fact.term}</dt>
					<dd>{fact.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<style>
	.open {
		padding-block: clamp(48px, 6.1vw, 88px);
		background: var(--ms-surface-2);
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: clamp(32px, 5.6vw, 80px);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.lead {
		max-inline-size: 30em;
	}
	dl {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-content: start;
		margin: 0;
		border-block-start: 1px solid var(--ms-border-strong);
	}
	dl div {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-block: 20px;
		padding-inline-end: 20px;
		border-block-end: 1px solid var(--ms-border-strong);
	}
	dt {
		font-size: 14px;
		color: var(--ms-text-muted);
	}
	dd {
		margin: 0;
		font-size: 19px;
		font-weight: 600;
	}

	@media (max-width: 1023.98px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 767.98px) {
		.text {
			gap: 14px;
		}
		dl {
			grid-template-columns: minmax(0, 1fr);
		}
		dl div {
			gap: 2px;
			padding-block: 14px;
		}
		dt {
			font-size: 13.5px;
		}
		dd {
			font-size: 17px;
		}
	}
</style>
