<script lang="ts">
	import type { Snippet } from 'svelte';
	import RichText from '../RichText.svelte';

	// The downloads of a specification, on /implement/ and /implement/relay/:
	// heading and note, then the cards (children) in a grid. .dl-grid is what
	// the end-to-end tests look for.
	let { id, title, note, children }: { id: string; title: string; note: string; children: Snippet } = $props();
</script>

<section class="downloads" aria-labelledby={id}>
	<div class="wrap">
		<div class="dl-head">
			<h2 {id}>{title}</h2>
			<p class="muted"><RichText text={note} /></p>
		</div>
		<div class="dl-grid">{@render children()}</div>
	</div>
</section>

<style>
	.downloads {
		padding-block: clamp(32px, 3.9vw, 56px) clamp(56px, 6.7vw, 96px);
		border-block-start: 1px solid var(--ms-border);
	}
	.dl-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px 16px;
		margin-block-end: 20px;
	}
	h2 {
		font-size: clamp(22px, 1.2rem + 0.4vw, 26px);
		line-height: 1.25;
	}
	.dl-head p {
		font-size: 14.5px;
	}
	.dl-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}
	@media (max-width: 1023px) {
		.dl-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767px) {
		.dl-head {
			flex-direction: column;
		}
		.dl-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
	}
</style>
