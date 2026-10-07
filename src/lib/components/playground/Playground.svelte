<script lang="ts">
	import Decision from '$lib/components/Decision.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StepNumber from '$lib/components/StepNumber.svelte';
	import type { IconName } from '$lib/icons';
	import { m } from '$lib/paraglide/messages';
	import { DAYS, HOUSEHOLD_ZONE, REFERENCE_MONDAY, defaultEntityId } from '$lib/playground/request';
	import { categoryLabel, actionLabel, type Texts } from '$lib/playground/texts';
	import { CATEGORIES, actionsOf } from '$lib/playground/vocab';
	import './playground.css';

	// The interactive playground. The page renders its frame and the request form; the
	// script (src/client/pages/playground.ts) fills in rules, result, overview and JSON.
	// Hidden without JavaScript (.js-only).
	let { examples, texts, locale, version }: { examples: Record<string, string>; texts: Texts; locale: string; version: string } = $props();

	const cards: { id: string; icon: IconName; title: string; body: string }[] = [
		{ id: 'voice', icon: 'voice', title: m.playground_ex_voice_title(), body: m.playground_ex_voice_body() },
		{ id: 'energy', icon: 'energy', title: m.playground_ex_energy_title(), body: m.playground_ex_energy_body() },
		{ id: 'shopping', icon: 'cart', title: m.playground_ex_shopping_title(), body: m.playground_ex_shopping_body() },
		{ id: 'build', icon: 'build', title: m.playground_ex_build_title(), body: m.playground_ex_build_body() }
	];
	const tabs: { id: string; icon: IconName; label: string }[] = [
		{ id: 'rules', icon: 'menu', label: m.playground_tab_rules() },
		{ id: 'test', icon: 'play', label: m.playground_tab_test() },
		{ id: 'overview', icon: 'layers', label: m.playground_tab_overview() },
		{ id: 'json', icon: 'code', label: m.playground_tab_json() }
	];
	const days = { mon: m.playground_day_mon, tue: m.playground_day_tue, wed: m.playground_day_wed, thu: m.playground_day_thu, fri: m.playground_day_fri, sat: m.playground_day_sat, sun: m.playground_day_sun };
	const DEFAULT = { category: 'lock', action: 'unlock', day: 2, time: '19:00' };
	const dateLabel = $derived(new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${REFERENCE_MONDAY}T12:00:00Z`)));
</script>

<div
	class="js-only pg"
	id="pg"
	data-tab="rules"
	data-locale={locale}
	data-texts={JSON.stringify(texts)}
	data-examples={JSON.stringify(examples)}
>
	<section class="pg-step pg-choose" aria-labelledby="pg-s1">
		<h2 id="pg-s1" class="pg-h"><span class="pg-num"><StepNumber n={1} size={30} /></span>{m.playground_s1()}</h2>
		<div class="pg-examples" role="radiogroup" aria-labelledby="pg-s1">
			{#each cards as card, i (card.id)}
				<label class="pg-example">
					<input type="radio" name="pg-example" value={card.id} checked={i === 0} class="visually-hidden" />
					<span class="pg-example-head"><Icon name={card.icon} size={18} /><strong>{card.title}</strong><span class="pg-tick"><Icon name="check" size={16} stroke={2.4} /></span></span>
					<span class="pg-example-body">{card.body}</span>
				</label>
			{/each}
		</div>
	</section>

	<div class="pg-bar">
		<div class="pg-tabs" role="tablist" aria-label={m.playground_tabs_label()}>
			{#each tabs as tab, i (tab.id)}
				<button type="button" role="tab" id="pg-tab-{tab.id}" data-tab-target={tab.id} aria-selected={i === 0} tabindex={i === 0 ? 0 : -1}>
					<Icon name={tab.icon} size={18} /><span>{tab.label}</span>
				</button>
			{/each}
		</div>
		<p class="pg-line"><span class="visually-hidden">{m.playground_result_line()}: </span><span class="pg-line-text" id="pg-line-text"></span><span id="pg-line-chip"></span></p>
	</div>

	<div class="pg-cols">
		<section class="pg-step pg-panel pg-card" id="pg-panel-rules" data-panel="rules" aria-labelledby="pg-s2">
			<div class="pg-card-head">
				<h2 id="pg-s2" class="pg-h"><span class="pg-num"><StepNumber n={2} size={30} /></span>{m.playground_s2()}</h2>
				<span class="pg-count mono" id="pg-rule-count"></span>
			</div>
			<div id="pg-rules" class="pg-rules"></div>
			<p class="pg-default"><Icon name="minus" size={16} />{m.playground_default_note()}</p>
			<button type="button" class="btn btn-secondary btn-sm pg-add" id="pg-add"><Icon name="plus" size={18} />{m.playground_add_rule()}</button>
			<p class="pg-chain">
				<span>{m.playground_strict_note()}</span>
				<span class="pg-chain-chips"><Decision value="deny" /><span aria-hidden="true">›</span><Decision value="ask" /><span aria-hidden="true">›</span><Decision value="allow" /></span>
			</p>
		</section>

		<div class="pg-side pg-panel" id="pg-panel-test" data-panel="test">
			<section class="pg-step pg-card" aria-labelledby="pg-s3">
				<h2 id="pg-s3" class="pg-h"><span class="pg-num"><StepNumber n={3} size={30} /></span>{m.playground_s3()}</h2>
				<div class="pg-form">
					<label class="pg-field"><span>{m.playground_req_device()}</span>
						<select id="pg-req-category">
							{#each CATEGORIES as c (c)}<option value={c} selected={c === DEFAULT.category}>{categoryLabel(texts, c)}</option>{/each}
						</select>
					</label>
					<label class="pg-field"><span>{m.playground_req_action()}</span>
						<select id="pg-req-action">
							{#each actionsOf(DEFAULT.category) as a (a)}<option value={a} selected={a === DEFAULT.action}>{actionLabel(texts, a)}</option>{/each}
						</select>
					</label>
					<label class="pg-field"><span>{m.playground_req_day()}</span>
						<select id="pg-req-day">
							{#each DAYS as d, i (d)}<option value={i} selected={i === DEFAULT.day}>{days[d]()}</option>{/each}
						</select>
					</label>
					<label class="pg-field"><span>{m.playground_req_time()}</span>
						<input id="pg-req-time" type="time" step="60" value={DEFAULT.time} required />
					</label>
					<label class="pg-field pg-wide" id="pg-req-value-field" hidden><span id="pg-req-value-label">{m.playground_req_value()}</span>
						<input id="pg-req-value" type="text" inputmode="decimal" autocomplete="off" />
					</label>
				</div>
				<details class="pg-more">
					<summary><Icon name="chevron" size={16} />{m.playground_req_more()}</summary>
					<div class="pg-form">
						<label class="pg-field"><span>{m.playground_req_area()} <span class="muted">({m.playground_field_optional()})</span></span>
							<input id="pg-req-area" type="text" autocomplete="off" spellcheck="false" />
						</label>
						<label class="pg-field"><span>{m.playground_req_entity()}</span>
							<input id="pg-req-entity" type="text" autocomplete="off" spellcheck="false" placeholder={defaultEntityId(DEFAULT.category)} aria-describedby="pg-req-entity-hint" />
							<span class="pg-hint" id="pg-req-entity-hint">{m.playground_req_entity_hint({ entity: defaultEntityId(DEFAULT.category) })}</span>
						</label>
						<label class="pg-check pg-wide"><input id="pg-req-critical" type="checkbox" /><span>{m.playground_req_critical()}</span></label>
					</div>
				</details>
				<p class="pg-hint">{m.playground_req_context({ zone: HOUSEHOLD_ZONE, date: dateLabel })}</p>
			</section>

			<section class="pg-step pg-card pg-result" aria-labelledby="pg-s4">
				<h2 id="pg-s4" class="pg-h"><span class="pg-num"><StepNumber n={4} size={30} /></span>{m.playground_s4()}</h2>
				<div id="pg-result" aria-live="polite" aria-atomic="true"></div>
				<p class="pg-hint">{m.playground_engine({ version })}</p>
			</section>
		</div>
	</div>

	<section class="pg-step pg-card pg-panel" id="pg-panel-overview" data-panel="overview" aria-labelledby="pg-s5">
		<div class="pg-card-head pg-wrap">
			<h2 id="pg-s5" class="pg-h"><span class="pg-num"><StepNumber n={5} size={30} /></span>{m.playground_s5()} <span class="pg-at" id="pg-matrix-at"></span></h2>
			<ul class="pg-legend">
				<li><Decision value="allow" size="icon" /><span aria-hidden="true">{m.common_allow()}</span></li>
				<li><Decision value="ask" size="icon" /><span aria-hidden="true">{m.common_ask()}</span></li>
				<li><Decision value="deny" size="icon" /><span aria-hidden="true">{m.common_deny()}</span></li>
				<li><span class="pg-na-dot" aria-hidden="true"></span><span>{m.playground_legend_na()}</span></li>
			</ul>
		</div>
		<div class="pg-matrix-scroll" id="pg-matrix"></div>
		<p class="pg-hint" id="pg-matrix-hint"><span class="pg-desktop">{m.playground_matrix_hint()}</span><span class="pg-mobile">{m.playground_matrix_hint_mobile()}</span></p>
	</section>

	<section class="pg-step pg-card pg-panel" id="pg-panel-json" data-panel="json" aria-labelledby="pg-s6">
		<div class="pg-card-head pg-wrap">
			<h2 id="pg-s6" class="pg-h"><span class="pg-num"><StepNumber n={6} size={30} /></span>{m.playground_s6()}</h2>
			<div class="pg-json-actions">
				<span id="pg-badge" class="pg-badge" data-valid="true"></span>
				<button type="button" class="btn btn-secondary btn-sm" id="pg-copy"><Icon name="copy" size={18} /><span>{m.playground_copy()}</span></button>
				<button type="button" class="btn btn-primary btn-sm" id="pg-download"><Icon name="download" size={18} /><span>{m.playground_download()}</span></button>
				<span class="visually-hidden" id="pg-copy-status" aria-live="polite"></span>
			</div>
		</div>
		<p class="pg-hint" id="pg-json-hint">{m.playground_edit_hint()}</p>
		<div id="pg-problem" class="pg-problem" role="alert" hidden></div>
		<div class="pg-editor">
			<div class="pg-gutter mono" id="pg-gutter" aria-hidden="true"></div>
			<textarea id="pg-json" class="mono" spellcheck="false" autocomplete="off" wrap="off" aria-label={m.playground_json_label()} aria-describedby="pg-json-hint"></textarea>
		</div>
	</section>

	<template id="pg-chips">
		{#each ['allow', 'ask', 'deny'] as const as value (value)}
			<span data-chip="{value}-sm"><Decision {value} /></span>
			<span data-chip="{value}-xl"><Decision {value} size="xl" /></span>
			<span data-chip="{value}-icon"><Decision {value} size="icon" /></span>
		{/each}
	</template>
</div>

