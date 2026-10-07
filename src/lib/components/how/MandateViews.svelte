<script lang="ts">
	import CodeBlock from '../CodeBlock.svelte';
	import Decision from '../Decision.svelte';
	import Icon from '../Icon.svelte';
	import example from '$lib/content/example-mandate.json';
	import exampleText from '$lib/content/example-mandate.json?raw';
	import { t } from '$lib/content/text';
	import type { Mandate } from '$lib/how/mandate-check';
	import { plainRows } from '$lib/how/plain';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	// One mandate (src/lib/content/example-mandate.json), shown as sentences and
	// as the JSON file itself. WAI-ARIA tabs with JavaScript; without it both
	// panels are shown one after the other.
	const rows = plainRows(example as Mandate);
	const tabs = [
		{ id: 'plain', label: m.how_view_plain() },
		{ id: 'json', label: m.how_view_json() }
	];
</script>

<section class="wrap views" aria-labelledby="how-views">
	<div class="side">
		<h2 id="how-views">{m.how_views_title()}</h2>
		<p class="sub">{m.how_views_sub()}</p>
		<a class="text-link" href={pathIn('/playground/', getLocale())}>{m.how_views_try()}<Icon name="arrow" size={18} stroke={2} /></a>
	</div>
	<div class="tabs" data-how-tabs>
		<div class="tablist js-only" role="tablist" aria-label={m.how_views_title()}>
			{#each tabs as tab, i (tab.id)}
				<button
					type="button"
					role="tab"
					id="how-tab-{tab.id}"
					aria-controls="how-panel-{tab.id}"
					aria-selected={i === 0 ? 'true' : 'false'}
					tabindex={i === 0 ? 0 : -1}>{tab.label}</button
				>
			{/each}
		</div>
		<div class="panel" id="how-panel-plain" data-tabpanel-for="how-tab-plain" data-active>
			<h3 class="no-js-only panel-title">{m.how_view_plain()}</h3>
			<ul class="plain">
				{#each rows as row (row.id)}
					<li><Icon name={row.icon} size={20} /><span class="rule">{t(row.text)}</span><Decision value={row.decision} /></li>
				{/each}
			</ul>
		</div>
		<div class="panel" id="how-panel-json" data-tabpanel-for="how-tab-json">
			<h3 class="no-js-only panel-title">{m.how_view_json()}</h3>
			<CodeBlock code={exampleText.trimEnd()} file="voice-assistant.json" id="how-mandate-json" />
		</div>
	</div>
</section>

<style>
	.views {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 64px;
		align-items: start;
		padding-block: clamp(40px, 5.6vw, 80px);
	}
	.side {
		position: sticky;
		inset-block-start: 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.sub {
		font-size: 18px;
		color: var(--ms-text-muted);
	}
	.side .text-link {
		align-self: flex-start;
		margin-block-start: 8px;
	}
	.tabs {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-inline-size: 0;
	}
	.tablist {
		display: inline-flex;
		align-self: flex-start;
		gap: 2px;
		padding: 3px;
		border: 1px solid var(--ms-border);
		border-radius: 10px;
		background: var(--ms-surface);
	}
	[role='tab'] {
		min-block-size: 38px;
		padding-inline: 18px;
		border: 0;
		border-radius: 7px;
		background: transparent;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}
	[role='tab'][aria-selected='true'] {
		background: var(--ms-btn-bg);
		color: var(--ms-btn-fg);
	}
	:global(html.js) .panel:not(:global([data-active])) {
		display: none;
	}
	.panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-inline-size: 0;
		border-radius: 14px;
	}
	.panel-title {
		font-size: 17px;
	}
	.plain {
		margin: 0;
		padding: 0;
		list-style: none;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
		overflow: hidden;
	}
	.plain li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 13px 18px;
		border-block-end: 1px solid var(--ms-border);
		color: var(--ms-text-muted);
	}
	.plain li:last-child {
		border-block-end: 0;
	}
	.rule {
		flex: 1;
		font-size: 16px;
		color: var(--ms-text);
	}
	@media (max-width: 1023px) {
		.views {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
		}
		.side {
			position: static;
		}
	}
	@media (max-width: 767px) {
		.tablist {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-self: stretch;
		}
		[role='tab'] {
			min-block-size: 44px;
		}
		.plain li {
			gap: 10px;
			padding: 10px 12px;
		}
		.rule {
			font-size: 15px;
			line-height: 1.35;
		}
	}
	@media (forced-colors: active) {
		[role='tab'][aria-selected='true'] {
			outline: 2px solid Highlight;
		}
	}
</style>
