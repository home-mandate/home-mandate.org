<script lang="ts">
	import Icon from '../Icon.svelte';
	import { t } from '$lib/content/text';
	import type { K } from '$lib/content/types';
	import { BLOCKS } from '$lib/how/blocks';
	import { categoryCount, vocabulary } from '$lib/how/vocabulary';
	import { m } from '$lib/paraglide/messages';

	// The five terms of the model with their term in SPEC-v0 section 2.
	const count = categoryCount(vocabulary);
	const blocks = BLOCKS.map((b) => ({
		...b,
		term: t(`how_block_${b.id}` as K),
		// Only the device text has a parameter: the number of vocabulary categories.
		body: b.id === 'device' ? m.how_block_device_body({ count }) : t(`how_block_${b.id}_body` as K)
	}));
</script>

<section class="wrap blocks" aria-labelledby="how-blocks">
	<h2 id="how-blocks">{m.how_blocks_title()}</h2>
	<ul class="tiles">
		{#each blocks as block (block.spec)}
			<li class="tile">
				<span class="ic"><Icon name={block.icon} size={22} /></span>
				<span class="text">
					<strong>{block.term}</strong>
					<span class="body">{block.body}</span>
				</span>
				<span class="spec"><span class="visually-hidden">{m.how_block_spec()}: </span><code>{block.spec}</code></span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.blocks {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-block-end: clamp(40px, 5.6vw, 80px);
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tile {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 22px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.ic {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		border-radius: 11px;
		background: var(--ms-surface-2);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	strong {
		font-size: 19px;
		font-weight: 650;
	}
	.body {
		font-size: 15.5px;
		color: var(--ms-text-muted);
		text-wrap: pretty;
	}
	.spec {
		margin-block-start: auto;
	}
	.spec code {
		padding: 0;
		background: none;
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	@media (max-width: 1023px) {
		.tiles {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767px) {
		.blocks {
			gap: 10px;
		}
		.tiles {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
		.tile {
			display: grid;
			grid-template-columns: 40px minmax(0, 1fr);
			column-gap: 14px;
			row-gap: 4px;
			padding: 14px;
			border-radius: 12px;
		}
		.ic {
			inline-size: 40px;
			block-size: 40px;
			border-radius: 10px;
		}
		.text {
			gap: 2px;
		}
		strong {
			font-size: 17px;
		}
		.body {
			font-size: 15px;
		}
		.spec {
			grid-column: 2;
		}
	}
	@media (forced-colors: active) {
		.tile {
			border-color: CanvasText;
		}
	}
</style>
