<script lang="ts">
	import Decision from '../Decision.svelte';
	import Icon from '../Icon.svelte';
	import { DEFAULT_PATH, PATHS } from '$lib/how/path';
	import { m } from '$lib/paraglide/messages';

	// All three paths are in the HTML; data-path on the root (set by the page
	// script from the radio group) decides which parts show. [data-when] lists
	// the paths an element belongs to. Without JavaScript the "ask" path is fixed.
	const words = { allow: m.common_allow(), ask: m.common_ask(), deny: m.common_deny() };
	const explain = {
		allow: [m.how_path_allow_title(), m.how_path_allow()],
		ask: [m.how_path_ask_title(), m.how_path_ask()],
		deny: [m.how_path_deny_title(), m.how_path_deny()]
	};
</script>

{#snippet arrow(cls: string, labels: [string, string][])}
	<div class="arrow {cls}">
		{#each labels as [when, label] (when)}<span class="label" data-when={when}>{label}</span>{/each}
		<span class="line"><span class="stroke"></span><svg class="tip mirror" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l8 5-8 5z" /></svg></span>
	</div>
{/snippet}

<section class="band" aria-labelledby="how-path">
	<div class="wrap root" data-how-path data-path={DEFAULT_PATH}>
		<div class="head">
			<div class="intro">
				<h2 id="how-path">{m.how_path_title()}</h2>
				<p class="sub">{m.how_path_sub()}</p>
			</div>
			<fieldset class="picker js-only">
				<legend class="visually-hidden">{m.how_path_pick()}</legend>
				{#each PATHS as p (p)}
					<label class="choice {p}">
						<input type="radio" name="how-path" value={p} checked={p === DEFAULT_PATH} data-path-choice />
						<Icon name={p} size={15} stroke={2.6} />{words[p]}
					</label>
				{/each}
			</fieldset>
		</div>

		<div class="flow">
			<div class="node agent">
				<span class="ic round"><Icon name="agent" size={26} /></span>
				<span class="txt"><strong>{m.how_node_agent()}</strong><span class="sub">{m.how_node_agent_sub()}</span></span>
			</div>
			{@render arrow('a-request', [['allow ask deny', m.how_arrow_request()]])}
			<div class="node guard">
				<span class="ic"><Icon name="guard" size={26} /></span>
				<span class="txt"
					><strong>{m.how_node_guard()}</strong><span class="sub">{m.how_node_guard_sub()}<span class="v-only">&nbsp;· {m.how_node_guard_checks()}</span></span></span
				>
			</div>
			{@render arrow('a-answer', [['allow ask deny', m.how_arrow_answer()]])}
			<div class="node decision">
				{#each PATHS as p (p)}<span class="ic round {p}" data-when={p}><Icon name={p} size={26} stroke={2.4} /></span>{/each}
				<span class="txt">
					<strong>{m.how_node_decision()}</strong>
					{#each PATHS as p (p)}<span class="sub" data-when={p}><Decision value={p} /></span>{/each}
				</span>
			</div>
			{@render arrow('a-command', [
				['allow ask', m.how_arrow_command()],
				['deny', m.how_arrow_none()]
			])}
			<div class="node device">
				<span class="ic" data-when="allow ask"><Icon name="device" size={26} /></span>
				<span class="ic" data-when="deny"><Icon name="stop" size={26} /></span>
				<span class="txt">
					<strong>{m.how_node_device()}</strong>
					<span class="sub" data-when="allow ask">{m.how_node_device_sub()}</span>
					<span class="sub" data-when="deny">{m.how_node_device_stop()}</span>
				</span>
			</div>

			<span class="vline checks-line" aria-hidden="true"></span>
			<span class="checks-label">{m.how_arrow_checks()}</span>
			<div class="node small mandate">
				<span class="ic"><Icon name="doc" size={22} /></span>
				<span class="txt"><strong>{m.how_node_mandate()}</strong><span class="sub">{m.how_node_mandate_sub()}</span></span>
			</div>
			<span class="vline phone-line" aria-hidden="true"></span>
			<div class="node small phone">
				<span class="ic"><Icon name="phone-ask" size={22} /></span>
				<span class="txt"><strong>{m.how_node_phone()}</strong><span class="sub">{m.how_node_phone_sub()}</span></span>
			</div>
			<div class="log">
				<Icon name="log" size={22} />
				<span class="txt"><strong>{m.how_node_log()}</strong> <span class="sub">{m.how_node_log_sub()}</span></span>
			</div>
		</div>

		<p class="explain" aria-live="polite" aria-atomic="true">
			{#each PATHS as p (p)}<span data-when={p}><strong>{explain[p][0]}</strong> {explain[p][1]}</span>{/each}
		</p>
	</div>
</section>

<style>
	.band {
		background: var(--ms-surface);
		border-block: 1px solid var(--ms-border);
	}
	.root {
		display: flex;
		flex-direction: column;
		gap: 28px;
		padding-block: clamp(40px, 5.6vw, 80px);
	}
	/* Only the parts of the current path. */
	.root:global([data-path='allow'] [data-when]:not([data-when~='allow'])),
	.root:global([data-path='ask'] [data-when]:not([data-when~='ask'])),
	.root:global([data-path='deny'] [data-when]:not([data-when~='deny'])) {
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
		max-inline-size: 640px;
	}
	.intro .sub {
		font-size: 18px;
		color: var(--ms-text-muted);
	}
	.picker {
		display: flex;
		flex: none;
		gap: 2px;
		margin: 0;
		padding: 3px;
		border: 1px solid var(--ms-border);
		border-radius: 11px;
		background: var(--ms-bg);
	}
	.choice {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-block-size: 40px;
		padding-inline: 10px 14px;
		border: 1px solid transparent;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}
	.choice input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	.choice:has(input:focus-visible) {
		outline: 2px solid var(--ms-focus);
		outline-offset: 2px;
	}
	.choice.allow:has(input:checked) {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
		color: var(--ms-allow-fg);
	}
	.choice.ask:has(input:checked) {
		border-color: var(--ms-ask-border);
		background: var(--ms-ask-bg);
		color: var(--ms-ask-fg);
	}
	.choice.deny:has(input:checked) {
		border-color: var(--ms-deny-border);
		background: var(--ms-deny-bg);
		color: var(--ms-deny-fg);
	}

	/* Desktop: Agent → guard → decision → device, mandate and phone below, log at the bottom. */
	.flow {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 120px minmax(0, 1fr) 120px minmax(0, 1fr) 120px minmax(0, 1fr);
		grid-template-rows: auto 56px auto 40px auto;
		align-items: center;
		padding: 36px 32px 28px;
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		background: var(--ms-bg);
	}
	.node {
		grid-row: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		block-size: 100%;
		padding: 18px 12px;
		border: 1.5px solid var(--ms-text);
		border-radius: 14px;
		background: var(--ms-surface);
		text-align: center;
		transition:
			opacity var(--ms-dur) var(--ms-ease),
			border-color var(--ms-dur) var(--ms-ease);
	}
	.txt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.node strong {
		font-size: 17px;
		font-weight: 650;
	}
	.node .sub {
		font-size: 14px;
		color: var(--ms-text-muted);
	}
	.ic {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 52px;
		block-size: 52px;
		border-radius: 12px;
		background: var(--ms-surface-2);
	}
	.ic.round {
		border-radius: 50%;
	}
	.ic.allow {
		color: var(--ms-allow-fg);
	}
	.ic.ask {
		color: var(--ms-ask-fg);
	}
	.ic.deny {
		color: var(--ms-deny-fg);
	}
	.agent {
		grid-column: 1;
	}
	.guard {
		grid-column: 3;
	}
	.decision {
		grid-column: 5;
	}
	.device {
		grid-column: 7;
	}
	.root:global([data-path='allow']) .decision {
		border-color: var(--ms-allow-border);
	}
	.root:global([data-path='ask']) .decision {
		border-color: var(--ms-ask-border);
	}
	.root:global([data-path='deny']) .decision {
		border-color: var(--ms-deny-border);
	}
	/* Inactive parts: dashed and muted, never transparent text (contrast AA). */
	.root:global([data-path='deny']) .device {
		border-color: var(--ms-border-strong);
		border-style: dashed;
		color: var(--ms-text-muted);
	}

	.arrow {
		grid-row: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding-inline: 6px;
		color: var(--ms-border-strong);
	}
	.a-request {
		grid-column: 2;
	}
	.a-answer {
		grid-column: 4;
	}
	.a-command {
		grid-column: 6;
	}
	.root:global([data-path='deny']) .a-command {
		color: var(--ms-text-muted);
	}
	.label {
		font-size: 13px;
		line-height: 1.25;
		color: var(--ms-text-muted);
		text-align: center;
	}
	.line {
		display: flex;
		align-items: center;
		inline-size: 100%;
	}
	.stroke {
		flex: 1;
		block-size: 2px;
		background: currentColor;
	}
	.tip {
		margin-inline-start: -2px;
	}
	.tip path {
		fill: currentColor;
	}

	.vline {
		grid-row: 2;
		justify-self: center;
		inline-size: 2px;
		block-size: 100%;
		background: var(--ms-border-strong);
	}
	.checks-line {
		grid-column: 3;
	}
	.checks-label {
		grid-row: 2;
		grid-column: 3;
		justify-self: start;
		margin-inline-start: calc(50% + 12px);
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	.node.small {
		grid-row: 3;
		gap: 8px;
		padding: 16px 12px;
		border-color: var(--ms-border-strong);
	}
	.small .ic {
		inline-size: 44px;
		block-size: 44px;
		border-radius: 10px;
	}
	.small strong {
		font-size: 16px;
	}
	.small .sub {
		font-size: 13.5px;
	}
	.mandate {
		grid-column: 3;
	}
	.phone-line {
		grid-column: 5;
		background: var(--ms-border);
	}
	.phone {
		grid-column: 5;
	}
	.root:not(:global([data-path='ask'])) .phone-line {
		opacity: 0.35;
	}
	.root:not(:global([data-path='ask'])) .phone {
		border-color: var(--ms-border-strong);
		border-style: dashed;
		color: var(--ms-text-muted);
	}
	.root:not(:global([data-path='ask'])) .phone .ic {
		color: var(--ms-text-muted);
	}
	.root:global([data-path='ask']) .phone {
		border-color: var(--ms-ask-border);
	}
	.root:global([data-path='ask']) .phone .ic {
		color: var(--ms-ask-fg);
	}
	.root:global([data-path='ask']) .phone-line {
		background: var(--ms-ask-border);
	}
	.log {
		grid-row: 5;
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px;
		border: 1.5px dashed var(--ms-border-strong);
		border-radius: 12px;
		background: var(--ms-surface);
	}
	.log strong {
		font-weight: 650;
	}
	.log .txt {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 6px;
	}
	.log .sub {
		font-size: 15.5px;
		color: var(--ms-text-muted);
	}
	.v-only {
		display: none;
	}
	.explain {
		max-inline-size: 52em;
	}
	.explain strong {
		font-weight: 650;
	}

	/* Below 1024 px the flow runs top to bottom. */
	@media (max-width: 1023px) {
		.head {
			flex-direction: column;
			align-items: stretch;
			gap: 16px;
		}
		.picker {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.choice {
			min-block-size: 44px;
			padding-inline: 6px;
			font-size: 14px;
		}
		.flow {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			padding: 16px;
			border-radius: 14px;
		}
		.node,
		.node.small {
			flex-direction: row;
			gap: 12px;
			padding: 12px;
			border-radius: 12px;
			text-align: start;
		}
		.txt {
			align-items: flex-start;
			gap: 0;
		}
		.node strong,
		.small strong {
			font-size: 16px;
		}
		.node .sub,
		.small .sub {
			font-size: 14px;
		}
		.ic,
		.small .ic {
			inline-size: 40px;
			block-size: 40px;
			border-radius: 10px;
		}
		.arrow {
			flex-direction: row;
			align-items: center;
			gap: 10px;
			block-size: 34px;
			padding-inline: 31px 0;
		}
		.line {
			order: -1;
			inline-size: 2px;
			block-size: 100%;
		}
		.stroke {
			inline-size: 2px;
			block-size: 100%;
		}
		.tip {
			display: none;
		}
		.v-only {
			display: inline;
		}
		/* Order: agent, request, guard, answer, decision, (phone), command, device, log. */
		.agent {
			order: 1;
		}
		.a-request {
			order: 2;
		}
		.guard {
			order: 3;
		}
		.a-answer {
			order: 4;
		}
		.decision {
			order: 5;
		}
		.phone-line {
			order: 6;
			align-self: flex-start;
			block-size: 34px;
			margin-inline-start: 31px;
		}
		.phone {
			order: 7;
		}
		.a-command {
			order: 8;
		}
		.device {
			order: 9;
		}
		.log {
			order: 10;
			margin-block-start: 34px;
			padding: 12px;
			border-style: solid;
		}
		.log .txt {
			flex-direction: column;
			gap: 0;
		}
		.log .sub {
			font-size: 14px;
		}
		.mandate,
		.checks-line,
		.checks-label,
		.root:not(:global([data-path='ask'])) .phone,
		.root:not(:global([data-path='ask'])) .phone-line {
			display: none;
		}
	}
	@media (forced-colors: active) {
		.node,
		.flow,
		.log {
			border-color: CanvasText;
		}
		.choice:has(input:checked) {
			border-color: Highlight;
		}
	}
</style>
