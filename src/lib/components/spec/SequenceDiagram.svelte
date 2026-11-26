<script lang="ts">
	import type { Sequence } from '#lib/spec/sequence.ts';

	// A Mermaid sequence diagram of a specification, drawn by the site: one column
	// per participant with its lifeline, one row per message or note. On narrow
	// screens it becomes a numbered list "Gateway → Relay: text". The text is the
	// specification's (English), so the figure is English too.
	let { sequence }: { sequence: Sequence } = $props();

	// No style attributes (the CSP blocks them): the number of columns, the first
	// column of a step and how many it spans are classes (at most 8, see sequence.ts).
	const n = $derived(sequence.participants.length);
	const place = (a: number, b: number) => `s${Math.min(a, b) + 1} w${Math.abs(a - b) + 1}`;
	const label = $derived(`Sequence diagram: ${sequence.participants.join(', ')}`);
</script>

<figure class="sequence n{n}" aria-label={label} lang="en">
	<div class="heads" aria-hidden="true">
		{#each sequence.participants as p, i (i)}<span class="head">{p}</span>{/each}
	</div>
	<div class="body">
		<div class="lifelines" aria-hidden="true">
			{#each sequence.participants as p, i (i)}<span class="life" data-name={p}></span>{/each}
		</div>
		<ol class="steps">
			{#each sequence.steps as s, i (i)}
				<li class="{s.kind} {place(s.from, s.to)}" class:dashed={s.dashed} class:back={s.to < s.from}>
					<span class="who"
						>{sequence.participants[s.from]}{#if s.kind === 'message'}<span aria-hidden="true">&nbsp;→ </span><span class="visually-hidden">&nbsp;to </span
							>{sequence.participants[s.to]}{:else if s.to !== s.from}<span aria-hidden="true">&nbsp;· </span><span class="visually-hidden">&nbsp;and </span
							>{sequence.participants[s.to]}{/if}</span
					>
					<span class="text">{s.text}</span>
					{#if s.kind === 'message'}
						<span class="arrow" aria-hidden="true"
							><span class="stroke"></span><svg class="tip" width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 4-8 4z" /></svg></span
						>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</figure>

<style>
	.sequence {
		margin: 8px 0;
		padding: 20px 16px 16px;
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		background: var(--ms-bg);
		container-type: inline-size;
		font-size: 14px;
		line-height: 1.35;
	}
	.heads,
	.steps,
	.lifelines {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(0, 1fr));
	}
	.n2 {
		--n: 2;
	}
	.n3 {
		--n: 3;
	}
	.n4 {
		--n: 4;
	}
	.n5 {
		--n: 5;
	}
	.n6 {
		--n: 6;
	}
	.n7 {
		--n: 7;
	}
	.n8 {
		--n: 8;
	}
	.s1 {
		grid-column-start: 1;
	}
	.s2 {
		grid-column-start: 2;
	}
	.s3 {
		grid-column-start: 3;
	}
	.s4 {
		grid-column-start: 4;
	}
	.s5 {
		grid-column-start: 5;
	}
	.s6 {
		grid-column-start: 6;
	}
	.s7 {
		grid-column-start: 7;
	}
	.s8 {
		grid-column-start: 8;
	}
	.w1 {
		grid-column-end: span 1;
		--cols: 1;
	}
	.w2 {
		grid-column-end: span 2;
		--cols: 2;
	}
	.w3 {
		grid-column-end: span 3;
		--cols: 3;
	}
	.w4 {
		grid-column-end: span 4;
		--cols: 4;
	}
	.w5 {
		grid-column-end: span 5;
		--cols: 5;
	}
	.w6 {
		grid-column-end: span 6;
		--cols: 6;
	}
	.w7 {
		grid-column-end: span 7;
		--cols: 7;
	}
	.w8 {
		grid-column-end: span 8;
		--cols: 8;
	}
	.head {
		margin-inline: 4px;
		padding: 8px 6px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 10px;
		background: var(--ms-surface);
		font-weight: 650;
		text-align: center;
		overflow-wrap: anywhere;
	}
	.body {
		position: relative;
	}
	.lifelines {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.life {
		justify-self: center;
		inline-size: 0;
		border-inline-start: 1px dashed var(--ms-border-strong);
	}
	.steps {
		position: relative;
		row-gap: 6px;
		margin: 0;
		padding: 14px 0 4px;
		list-style: none;
	}
	li {
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
	}
	.who {
		display: none;
	}
	.text {
		padding-inline: 8px;
		text-align: center;
		overflow-wrap: anywhere;
	}
	.message .text {
		/* Readable over the lifelines it crosses. */
		align-self: center;
		max-inline-size: 100%;
		padding-block: 2px;
		background: var(--ms-bg);
	}
	.arrow {
		display: flex;
		align-items: center;
		block-size: 10px;
		/* From the middle of the first column to the middle of the last one. */
		margin-inline: calc(100% / var(--cols) / 2);
		color: var(--ms-text-muted);
	}
	.stroke {
		flex: 1;
		border-block-start: 2px solid currentColor;
	}
	.dashed .stroke {
		border-block-start-style: dashed;
	}
	.tip {
		flex: none;
		margin-inline-start: -2px;
		fill: currentColor;
	}
	.back .arrow {
		flex-direction: row-reverse;
	}
	.back .tip {
		margin-inline: 0 -2px;
		transform: scaleX(-1);
	}
	.note {
		/* A note covers its participants' columns, not only their middles. */
		padding: 8px 4px;
	}
	.note .text {
		padding: 8px 12px;
		border: 1px solid var(--ms-ask-border);
		border-radius: 8px;
		background: var(--ms-ask-bg);
		font-weight: 600;
	}

	/* Narrow: a numbered list, sender → receiver above each message. */
	@container (max-width: 560px) {
		.heads,
		.lifelines,
		.arrow {
			display: none;
		}
		.steps {
			display: flex;
			flex-direction: column;
			gap: 10px;
			padding: 0 0 0 24px;
			list-style: decimal;
		}
		li {
			display: list-item;
			padding: 0;
		}
		.who {
			display: block;
			font-size: 12.5px;
			font-weight: 650;
			color: var(--ms-text-muted);
		}
		.text,
		.message .text {
			display: block;
			padding: 0;
			text-align: start;
			background: none;
		}
		.note .text {
			margin-block-start: 4px;
			padding: 8px 12px;
			background: var(--ms-ask-bg);
		}
	}

	@media (forced-colors: active) {
		.note .text,
		.head {
			border: 1px solid CanvasText;
		}
	}
</style>
