<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	// SPEC-v0 section 1.1 as a drawing: who talks to whom, and which of those
	// interfaces the specification defines (solid) or leaves open (dashed).
	// The spec page renders it for the Mermaid block of that section
	// (src/lib/spec/diagrams.ts) in English, like the rest of the spec text.
	let { english = false }: { english?: boolean } = $props();

	// Names of protocols and products are the same in every language.
	const AGENT_PROTOCOL = 'MCP · HTTPS · OAuth 2.1';
	const PDP_PROTOCOL = 'AuthZEN';
	const PLATFORMS = 'Home Assistant, Matter';

	const o = $derived(english ? { locale: 'en' as const } : {});
	const t = $derived({
		figure: m.implement_overview_figure({}, o),
		agent: m.implement_overview_agent({}, o),
		agentSub: m.implement_overview_agent_sub({}, o),
		impl: m.implement_overview_impl({}, o),
		pepSub: m.implement_overview_pep_sub({}, o),
		pdpSub: m.implement_overview_pdp_sub({}, o),
		log: m.implement_overview_log({}, o),
		platform: m.implement_overview_platform({}, o),
		platformSub: m.implement_overview_example({ example: PLATFORMS }, o),
		human: m.implement_overview_human({}, o),
		humanSub: m.implement_overview_human_sub({}, o),
		request: m.implement_overview_request({}, o),
		requestExample: m.implement_overview_example({ example: AGENT_PROTOCOL }, o),
		query: m.implement_overview_query({ protocol: PDP_PROTOCOL }, o),
		decisions: [m.common_allow({}, o), m.common_ask({}, o), m.common_deny({}, o)].join(' / '),
		entries: m.implement_overview_entries({}, o),
		approval: m.implement_overview_approval({}, o),
		mandate: m.implement_overview_mandate({}, o),
		command: m.implement_overview_command({}, o),
		defined: m.implement_overview_defined({}, o),
		open: m.implement_overview_open({}, o)
	});
	const section = (number: string): string => m.implement_overview_section({ number }, o);
</script>

<!--
	An edge: a line in one direction, solid (defined by the specification) or
	dashed (left to the implementation). dir is the direction on wide screens
	(end, start, down, up), mdir the direction in a narrow box (down, up).
-->
{#snippet edge(cls: string, dir: string, mdir: string, style: 'solid' | 'dashed', label: string, extra = '', ref = '')}
	<div class="edge {cls} d-{dir} m-{mdir} {style}">
		<span class="label"
			>{label}{#if extra}<span class="extra">{extra}</span>{/if}{#if ref}<span class="ref"
					><span aria-hidden="true">§&nbsp;{ref}</span><span class="visually-hidden">({section(ref)})</span></span
				>{/if}</span
		>
		<span class="line" aria-hidden="true"
			><span class="stroke"></span><svg class="tip" width="12" height="12" viewBox="0 0 12 12"><path d="M2 1l8 5-8 5z" /></svg></span
		>
	</div>
{/snippet}

<figure class="overview" aria-label={t.figure} lang={english ? 'en' : undefined}>
	<div class="grid">
		<div class="node agent">
			<strong>{t.agent}</strong><span class="sub">{t.agentSub}</span>
		</div>
		{@render edge('e-request', 'end', 'down', 'dashed', t.request, t.requestExample)}

		<div class="impl">
			<span class="impl-name">{t.impl}</span>
			<div class="impl-grid">
				<div class="node pep">
					<strong>PEP</strong><span class="sub">{t.pepSub}</span>
				</div>
				<div class="pair p-pdp">
					{@render edge('', 'end', 'down', 'solid', t.query, '', '6')}
					{@render edge('back', 'start', 'up', 'solid', t.decisions)}
				</div>
				<div class="node pdp">
					<strong>PDP</strong><span class="sub">{t.pdpSub}</span>
				</div>
				{@render edge('e-entries', 'down', 'down', 'solid', t.entries, '', '9')}
				<div class="node log">
					<strong>{t.log}</strong>
				</div>
			</div>
		</div>

		{@render edge('e-command', 'end', 'down', 'dashed', t.command)}
		<div class="node platform">
			<strong>{t.platform}</strong><span class="sub">{t.platformSub}</span>
		</div>

		<div class="pair p-human">
			{@render edge('', 'down', 'up', 'dashed', t.approval, '', '11.1')}
			{@render edge('back', 'up', 'down', 'dashed', t.mandate, '', '3')}
		</div>
		<div class="node human">
			<strong>{t.human}</strong><span class="sub">{t.humanSub}</span>
		</div>
	</div>

	<figcaption class="legend">
		<span class="key"><span class="sample solid" aria-hidden="true"></span>{t.defined}</span>
		<span class="key"><span class="sample dashed" aria-hidden="true"></span>{t.open}</span>
	</figcaption>
</figure>

<style>
	.overview {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin: 0;
		padding: 28px 24px 20px;
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		background: var(--ms-bg);
		container-type: inline-size;
	}

	/* Wide screens: agent → implementation → platform, the human below the implementation. */
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 132px minmax(0, 2.6fr) 132px minmax(0, 1fr);
		grid-template-rows: auto 112px auto;
		align-items: center;
	}
	.agent {
		grid-area: 1 / 1;
	}
	.e-request {
		grid-area: 1 / 2;
	}
	.impl {
		grid-area: 1 / 3;
	}
	.e-command {
		grid-area: 1 / 4;
	}
	.platform {
		grid-area: 1 / 5;
	}
	.p-human {
		grid-area: 2 / 3;
		align-self: stretch;
		justify-self: center;
	}
	.human {
		grid-area: 3 / 3;
		justify-self: center;
		min-inline-size: 45%;
	}

	.node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 14px 12px;
		border: 1.5px solid var(--ms-text);
		border-radius: 12px;
		background: var(--ms-surface);
		text-align: center;
		min-inline-size: 0;
		overflow-wrap: break-word;
	}
	.node strong {
		font-size: 16px;
		font-weight: 650;
	}
	.node .sub {
		font-size: 13.5px;
		line-height: 1.35;
		color: var(--ms-text-muted);
	}

	.impl {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px 14px 16px;
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 14px;
		background: var(--ms-surface-2);
	}
	.impl-name {
		font-size: 13px;
		font-weight: 650;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ms-text-muted);
	}
	.impl-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 128px minmax(0, 1fr);
		grid-template-rows: auto 64px auto;
		align-items: center;
	}
	.pep {
		grid-area: 1 / 1;
	}
	.p-pdp {
		grid-area: 1 / 2;
	}
	.pdp {
		grid-area: 1 / 3;
	}
	.e-entries {
		grid-area: 2 / 1;
		justify-self: center;
		align-self: stretch;
	}
	.log {
		grid-area: 3 / 1;
		padding-block: 10px;
		border-color: var(--ms-border-strong);
	}

	/* Edges. */
	.pair {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.p-human {
		flex-direction: row;
		gap: 0;
	}
	.edge {
		--edge-style: solid;
		display: flex;
		gap: 6px;
		color: var(--ms-border-strong);
	}
	.edge.dashed {
		--edge-style: dashed;
	}
	.label {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 13px;
		line-height: 1.3;
		color: var(--ms-text-muted);
		text-align: center;
	}
	.extra,
	.ref {
		font-family: var(--ms-font-mono);
		font-size: 12px;
	}
	.line {
		display: flex;
		align-items: center;
	}
	.stroke {
		flex: 1;
	}
	.tip {
		flex: none;
	}
	.tip path {
		fill: currentColor;
	}

	/* Horizontal on wide screens: label above the line (below it for the way back). */
	.d-end,
	.d-start {
		flex-direction: column;
		padding-inline: 6px;
	}
	.d-start .label {
		order: 1;
	}
	.d-end .line {
		flex-direction: row;
	}
	.d-start .line {
		flex-direction: row-reverse;
	}
	.d-end .stroke,
	.d-start .stroke {
		border-block-start: 2px var(--edge-style) currentColor;
	}
	.d-end .tip {
		margin-inline-start: -2px;
	}
	.d-start .tip {
		margin-inline-end: -2px;
		transform: rotate(180deg);
	}
	:global([dir='rtl']) .d-end .tip {
		transform: scaleX(-1);
	}
	:global([dir='rtl']) .d-start .tip {
		transform: none;
	}

	/* Vertical on wide screens: label beside the line. */
	.d-down,
	.d-up {
		flex-direction: row;
		align-items: stretch;
	}
	.d-down .line,
	.d-up .line {
		inline-size: 12px;
	}
	.d-down .line {
		flex-direction: column;
	}
	.d-up .line {
		flex-direction: column-reverse;
	}
	.d-down .stroke,
	.d-up .stroke {
		border-inline-start: 2px var(--edge-style) currentColor;
	}
	.d-down .tip {
		margin-block-start: -2px;
		transform: rotate(90deg);
	}
	.d-up .tip {
		margin-block-end: -2px;
		transform: rotate(-90deg);
	}
	.d-down .label,
	.d-up .label {
		align-items: flex-start;
		justify-content: center;
		text-align: start;
	}
	/* The two lines meet in the middle: approval label before its line, mandate label after. */
	.p-human .d-down .label {
		align-items: flex-end;
		text-align: end;
	}
	.p-human .d-up {
		flex-direction: row-reverse;
	}
	.p-human .edge {
		gap: 10px;
		padding-inline: 4px;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		font-size: 13.5px;
		color: var(--ms-text-muted);
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.sample {
		inline-size: 32px;
		border-block-start: 2px solid var(--ms-border-strong);
	}
	.sample.dashed {
		border-block-start-style: dashed;
	}

	/*
	 * In a box narrower than 1080 px (a phone, a tablet, the text column of the
	 * spec page) everything runs top to bottom: agent and human side by side at
	 * the top, the implementation below them, the platform at the bottom.
	 */
	@media (max-width: 767px) {
		.overview {
			padding: 16px;
			border-radius: 14px;
		}
	}
	@container (max-width: 1079px) {
		.grid {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-template-rows: auto auto auto auto auto;
			column-gap: 12px;
			align-items: stretch;
			inline-size: 100%;
			max-inline-size: 640px;
			margin-inline: auto;
		}
		.agent {
			grid-area: 1 / 1;
		}
		.human {
			grid-area: 1 / 2;
			min-inline-size: 0;
			justify-self: stretch;
		}
		.e-request {
			grid-area: 2 / 1;
		}
		.p-human {
			grid-area: 2 / 2;
			justify-self: stretch;
		}
		.impl {
			grid-area: 3 / 1 / 4 / -1;
			padding: 10px 12px 12px;
		}
		.e-command {
			grid-area: 4 / 1 / 5 / -1;
		}
		.platform {
			grid-area: 5 / 1 / 6 / -1;
		}
		.impl-grid {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-template-rows: auto auto auto;
			column-gap: 12px;
			align-items: stretch;
		}
		.pep {
			grid-area: 1 / 1 / 2 / -1;
		}
		.p-pdp {
			grid-area: 2 / 1;
		}
		.pdp {
			grid-area: 3 / 1;
		}
		.e-entries {
			grid-area: 2 / 2;
			justify-self: stretch;
		}
		.log {
			grid-area: 3 / 2;
		}
		.node {
			padding: 10px;
		}
		.node strong {
			font-size: 15px;
		}
		.node .sub {
			font-size: 13px;
		}

		/* Every edge is vertical: line at the start, label beside it. */
		.pair,
		.p-human {
			flex-direction: column;
			gap: 6px;
		}
		.edge,
		.p-human .edge,
		.p-human .d-up {
			flex-direction: row;
			align-items: stretch;
			gap: 10px;
			min-block-size: 52px;
			padding: 0;
			padding-inline-start: 18px;
		}
		.edge .label,
		.p-human .d-down .label {
			order: 1;
			align-items: flex-start;
			justify-content: center;
			text-align: start;
		}
		.edge .line {
			inline-size: 12px;
		}
		.edge .stroke {
			border-block-start: 0;
			border-inline-start: 2px var(--edge-style) currentColor;
		}
		.edge .tip {
			margin: 0;
		}
		.overview .m-down .line {
			flex-direction: column;
		}
		.overview .m-up .line {
			flex-direction: column-reverse;
		}
		.overview .edge.m-down .tip {
			margin-block-start: -2px;
			transform: rotate(90deg);
		}
		.overview .edge.m-up .tip {
			margin-block-end: -2px;
			transform: rotate(-90deg);
		}
	}

	@media (forced-colors: active) {
		.overview,
		.node,
		.impl {
			border-color: CanvasText;
		}
		.edge,
		.sample {
			color: CanvasText;
			border-color: CanvasText;
		}
	}
</style>
