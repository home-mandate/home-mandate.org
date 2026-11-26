<script lang="ts" module>
	export interface ClassCard {
		id: string;
		req: string;
		name: string;
		body: string;
		footer: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	// The band of conformance classes on /implement/ and /implement/relay/: one
	// card per class with its id, whether it is required, name, description and
	// a footer line (cases or sections). extra adds cards after the classes.
	let {
		id,
		title,
		intro,
		classes,
		note,
		extra
	}: { id: string; title: string; intro: string; classes: ClassCard[]; note: string; extra?: Snippet } = $props();
</script>

<section class="band" aria-labelledby={id}>
	<div class="wrap">
		<div class="band-head">
			<h2 {id}>{title}</h2>
			<p class="muted">{intro}</p>
		</div>
		<ul class="classes">
			{#each classes as c (c.id)}
				<li class="class">
					<div class="class-top">
						<span class="class-id mono">{c.id}</span>
						<span class="req">{c.req}</span>
					</div>
					<h3>{c.name}</h3>
					<p class="muted">{c.body}</p>
					<p class="cases mono">{c.footer}</p>
				</li>
			{/each}
			{#if extra}{@render extra()}{/if}
		</ul>
		<p class="note muted">{note}</p>
	</div>
</section>

<style>
	.band {
		padding-block: clamp(32px, 3.9vw, 56px);
		border-block: 1px solid var(--ms-border);
		background: var(--ms-surface);
	}
	.band-head {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-block-end: 20px;
	}
	.band-head p {
		max-inline-size: 44em;
	}
	h2 {
		font-size: clamp(22px, 1.2rem + 0.4vw, 26px);
		line-height: 1.25;
	}
	.classes {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	/* Cards of extra use the same frame. */
	.classes > :global(li) {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 22px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-bg);
	}
	/* An extra card that is no class (li.dashed): same frame, dashed, without fill. */
	.classes > :global(li.dashed) {
		justify-content: center;
		border-style: dashed;
		background: transparent;
	}
	.class-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.class-id {
		padding: 2px 10px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		font-size: 13px;
	}
	.req {
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	.class h3 {
		font-size: 19px;
		font-weight: 650;
	}
	.class p {
		font-size: 15px;
	}
	.class .cases {
		margin-block-start: auto;
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	.note {
		max-inline-size: 60em;
		margin-block-start: 20px;
		font-size: 14.5px;
	}
	@media (max-width: 1023px) {
		.classes {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767px) {
		.classes {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
		.classes > :global(li) {
			gap: 6px;
			padding: 16px;
			border-radius: 12px;
		}
		.class h3 {
			font-size: 17px;
		}
	}
</style>
