<script lang="ts">
	import CodeBlock from '../CodeBlock.svelte';
	import Decision from '../Decision.svelte';
	import Icon from '../Icon.svelte';
	import TechDetails from '../TechDetails.svelte';
	import { t } from '$lib/content/text';
	import type { ChainView } from '$lib/how/chain';
	import { shortDigest } from '$lib/how/digest';
	import { m } from '$lib/paraglide/messages';

	// Four real log entries, hash-chained (SPEC-v0 section 9.4), computed at
	// build time both intact and with entry 2 edited. data-tampered on the root
	// (set by the page script) switches between the two; .intact-only and
	// .changed-only mark what belongs to one state.
	let { chain }: { chain: ChainView } = $props();
</script>

{#snippet link(ok: boolean)}
	<span class="link" class:broken={!ok}><Icon name={ok ? 'link' : 'broken'} size={26} stroke={1.9} />{ok ? m.how_log_ok() : m.how_log_broken()}</span>
{/snippet}

<section class="band" aria-labelledby="how-log">
	<div class="wrap root" data-how-chain>
		<div class="head">
			<div class="intro">
				<h2 id="how-log">{m.how_log_title()}</h2>
				<p class="sub">{m.how_log_sub()}</p>
			</div>
			<button type="button" class="btn tamper js-only" data-tamper aria-controls="how-chain">
				<span class="intact-only"><Icon name="edit" size={18} stroke={1.9} />{m.how_log_tamper()}</span>
				<span class="changed-only"><Icon name="undo" size={18} stroke={1.9} />{m.how_log_restore()}</span>
			</button>
		</div>

		<ol class="chain" id="how-chain">
			{#each chain.entries as e (e.n)}
				<li class="item">
					{#if e.n > 1}
						<div class="connector">
							{#if e.linked === e.changed.linked}
								{@render link(e.linked)}
							{:else}
								<span class="intact-only">{@render link(e.linked)}</span>
								<span class="changed-only">{@render link(e.changed.linked)}</span>
							{/if}
						</div>
					{/if}
					<div class="entry" class:edited={e.changed.edited} class:unlinked={!e.changed.linked}>
						<div class="meta mono">
							<span>#{e.n} · {e.time}</span>
							{#if e.changed.edited}<span class="badge changed-only">{m.how_log_edited()}</span>{/if}
						</div>
						<span class="what">{t(e.what)}</span>
						{#if e.decision === e.changed.decision}
							<Decision value={e.decision} />
						{:else}
							<span class="intact-only"><Decision value={e.decision} /></span>
							<span class="changed-only"><Decision value={e.changed.decision} /></span>
						{/if}
						<dl class="mono">
							<div><dt>prev</dt><dd class="prev">{shortDigest(e.prev)}</dd></div>
							<div class="digest">
								<dt>digest</dt>
								{#if e.digest === e.changed.digest}
									<dd>{shortDigest(e.digest)}</dd>
								{:else}
									<dd class="intact-only">{shortDigest(e.digest)}</dd>
									<dd class="changed-only">{shortDigest(e.changed.digest)}</dd>
								{/if}
							</div>
						</dl>
					</div>
				</li>
			{/each}
		</ol>

		<div class="status" role="status">
			<span class="intact-only ok"><Icon name="ok" size={20} stroke={1.9} /><span><strong>{m.how_log_ok_title()}</strong> {m.how_log_ok_body()}</span></span>
			<span class="changed-only bad"><Icon name="warning" size={20} stroke={1.9} /><span><strong>{m.how_log_bad_title()}</strong> {m.how_log_bad_body()}</span></span>
		</div>
		<p class="limits">{m.how_log_limits()}</p>
		<TechDetails title={m.how_log_tech()}>
			<p>{m.how_log_tech_text()}</p>
			<CodeBlock code={chain.jsonl} file="audit.jsonl" id="how-chain-jsonl" />
		</TechDetails>
	</div>
</section>

<style>
	.band {
		background: var(--ms-surface);
		border-block-start: 1px solid var(--ms-border);
	}
	.root {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-block: clamp(40px, 5.6vw, 80px) clamp(48px, 6.7vw, 96px);
	}
	/* State switch: intact by default (and without JavaScript). */
	.root:not(:global([data-tampered])) .changed-only,
	.root:global([data-tampered]) .intact-only {
		display: none;
	}
	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 32px;
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-inline-size: 680px;
	}
	.sub {
		font-size: 18px;
		color: var(--ms-text-muted);
		text-wrap: pretty;
	}
	.tamper {
		flex: none;
		min-block-size: 48px;
		padding-inline: 20px;
		border-color: var(--ms-ask-border);
		background: var(--ms-ask-bg);
		color: var(--ms-text);
		font-size: 16px;
	}
	.root:global([data-tampered]) .tamper {
		border-color: var(--ms-border-strong);
		background: var(--ms-btn2-bg);
	}
	.tamper span {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.chain {
		display: grid;
		grid-template-columns: minmax(0, 1fr) repeat(3, 56px minmax(0, 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		display: grid;
	}
	.item + .item {
		grid-column: span 2;
		grid-template-columns: subgrid;
	}
	.connector {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.link {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		color: var(--ms-text-muted);
		font-size: 12px;
		font-weight: 600;
		text-align: center;
	}
	.link.broken {
		color: var(--ms-deny-fg);
	}
	.entry {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		padding: 18px;
		border: 1.5px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-bg);
		min-inline-size: 0;
	}
	.root:global([data-tampered]) .entry.edited {
		border-color: var(--ms-ask-border);
	}
	.root:global([data-tampered]) .entry.unlinked {
		border-color: var(--ms-deny-border);
	}
	.root:global([data-tampered]) .entry.unlinked .prev {
		color: var(--ms-deny-fg);
	}
	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		align-self: stretch;
		gap: 8px;
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	.badge {
		padding: 1px 7px;
		border-radius: 5px;
		background: var(--ms-deny-bg);
		color: var(--ms-deny-fg);
		font: 600 12px var(--ms-font-sans);
	}
	.what {
		font-size: 16px;
		font-weight: 600;
	}
	dl {
		display: flex;
		flex-direction: column;
		gap: 3px;
		align-self: stretch;
		margin: 4px 0 0;
		padding-block-start: 10px;
		border-block-start: 1px solid var(--ms-border);
		font-size: 12.5px;
		line-height: 1.45;
	}
	dl div {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}
	dt {
		color: var(--ms-text-muted);
	}
	dd {
		margin: 0;
	}

	.status > span {
		display: flex;
		gap: 12px;
		padding: 14px 18px;
		border: 1px solid;
		border-radius: 12px;
	}
	.status :global(svg) {
		margin-block-start: 3px;
	}
	.status .ok {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
	}
	.status .ok :global(svg) {
		color: var(--ms-allow-fg);
	}
	.status .bad {
		border-color: var(--ms-deny-border);
		background: var(--ms-deny-bg);
	}
	.status .bad :global(svg) {
		color: var(--ms-deny-fg);
	}
	.status strong {
		font-weight: 650;
	}
	.limits {
		max-inline-size: 52em;
		font-size: 15.5px;
		color: var(--ms-text-muted);
	}
	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: stretch;
			gap: 16px;
		}
		.chain {
			display: flex;
			flex-direction: column;
		}
		.item,
		.item + .item {
			display: flex;
			flex-direction: column;
		}
		.connector {
			justify-content: flex-start;
			block-size: 36px;
			padding-inline-start: 20px;
		}
		.link {
			flex-direction: row;
			gap: 8px;
			font-size: 12.5px;
		}
		.link :global(svg) {
			inline-size: 18px;
			block-size: 18px;
		}
		.entry {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 6px 8px;
			align-items: center;
			padding: 12px 14px;
			border-radius: 12px;
		}
		.meta {
			grid-row: 2;
			grid-column: 1;
			justify-content: flex-start;
		}
		.what {
			grid-row: 1;
		}
		dl {
			grid-column: 1 / -1;
			margin: 0;
			padding-block-start: 6px;
		}
	}
	@media (max-width: 767px) {
		.status > span {
			padding: 12px 14px;
			font-size: 15px;
		}
	}
	@media (forced-colors: active) {
		.entry,
		.status > span {
			border-color: CanvasText;
		}
	}
</style>
