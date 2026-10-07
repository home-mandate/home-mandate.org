<script lang="ts">
	import ClassBadge from '$lib/components/implement/ClassBadge.svelte';
	import SubTabs from '$lib/components/implement/SubTabs.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { IMPLEMENTATIONS, type ImplementationKind } from '$lib/content/implementations';
	import { scripts } from '$lib/generated/client';
	import { KIND_FILTERS, kindCounts, kindsAttribute, type KindFilter } from '$lib/implement/list';
	import { m } from '$lib/paraglide/messages';
	import { SITE_REPOSITORY } from '$lib/site';

	const KIND_LABEL: Record<KindFilter, () => string> = {
		all: m.implement_kind_all,
		guard: m.implement_kind_guard,
		integration: m.implement_kind_integration,
		library: m.implement_kind_library,
		tool: m.implement_kind_tool
	};
	const counts = kindCounts(IMPLEMENTATIONS);
	const kinds = (list: ImplementationKind[]): string => list.map((k) => KIND_LABEL[k]()).join(', ');
	// The browser script fills in the numbers.
	const shownTemplate = $derived(m.implement_list_shown({ count: '{count}', total: '{total}' }));
</script>

<svelte:head>
	<title>{m.implement_list_title()} – {m.site_name()}</title>
	<meta name="description" content={m.implement_list_intro()} />
	<script type="module" src={scripts.implementations}></script>
</svelte:head>

<SubTabs current="implementations" />

<div class="wrap page">
	<header class="intro">
		<div class="intro-text">
			<h1>{m.implement_list_title()}</h1>
			<p class="lead">{m.implement_list_intro()}</p>
		</div>
		<a class="btn btn-secondary add" href="{SITE_REPOSITORY}/pulls">
			<Icon name="plus" size={18} stroke={2} />{m.implement_list_add()}<span class="visually-hidden">
				{m.common_external()}</span
			>
		</a>
	</header>

	<div class="filters js-only" role="group" aria-labelledby="filter-label" data-filters>
		<span id="filter-label" class="filter-label">{m.implement_list_filter()}</span>
		{#each KIND_FILTERS as f (f)}
			<button type="button" class="pill" data-filter={f} aria-pressed={f === 'all' ? 'true' : 'false'}>
				{KIND_LABEL[f]()} <span class="count">{counts[f]}</span>
			</button>
		{/each}
		<p class="visually-hidden" aria-live="polite" data-filter-status data-template={shownTemplate}></p>
	</div>

	<div class="table-wrap" role="region" aria-labelledby="list-caption">
		<table>
			<caption id="list-caption" class="visually-hidden">{m.implement_list_caption()}</caption>
			<thead>
				<tr>
					<th scope="col">{m.implement_col_name()}</th>
					<th scope="col">{m.implement_col_kind()}</th>
					<th scope="col">{m.implement_col_language()}</th>
					<th scope="col">{m.implement_col_license()}</th>
					<th scope="col">{m.implement_col_spec()}</th>
					<th scope="col">{m.implement_col_conformance()}</th>
					<th scope="col"><span class="visually-hidden">{m.implement_col_link()}</span></th>
				</tr>
			</thead>
			<tbody>
				{#each IMPLEMENTATIONS as impl (impl.name)}
					<tr data-kinds={kindsAttribute(impl.kinds)}>
						<th scope="row">
							<span class="who"><span class="name mono">{impl.name}</span><span class="origin">{impl.origin}</span></span>
						</th>
						<td>{kinds(impl.kinds)}</td>
						<td>{impl.language}</td>
						<td class="mono small">{impl.license}</td>
						<td class="mono small">{impl.spec}</td>
						<td>
							<span class="badges">
								{#each impl.classes as c (c)}<ClassBadge id={c} passed={impl.conformanceRun !== undefined} />{/each}
							</span>
							{#if impl.conformanceRun}<a class="run" href={impl.conformanceRun}>{m.implement_list_run()}</a>{/if}
						</td>
						<td>
							<a class="open" href={impl.url}>
								<Icon name="arrow-up-right" size={18} /><span class="visually-hidden"
									>{m.implement_list_open({ name: impl.name })} {m.common_external()}</span
								>
							</a>
						</td>
					</tr>
				{/each}
				<tr data-empty hidden>
					<td colspan="7" class="empty">{m.implement_list_empty()}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<ul class="cards">
		{#each IMPLEMENTATIONS as impl (impl.name)}
			<li class="card" data-kinds={kindsAttribute(impl.kinds)}>
				<h2 class="card-name">
					<a href={impl.url}
						><span class="mono">{impl.name}</span><Icon name="arrow-up-right" size={18} /><span class="visually-hidden"
							>{m.common_external()}</span
						></a
					>
				</h2>
				<span class="origin">{impl.origin}</span>
				<span class="facts">{kinds(impl.kinds)} · {impl.language} · {impl.license} · {impl.spec}</span>
				<span class="badges">
					{#each impl.classes as c (c)}<ClassBadge id={c} passed={impl.conformanceRun !== undefined} small />{/each}
				</span>
				{#if impl.conformanceRun}<a class="run" href={impl.conformanceRun}>{m.implement_list_run()}</a>{/if}
			</li>
		{/each}
		<li class="card empty" data-empty hidden>{m.implement_list_empty()}</li>
	</ul>

	<div class="legend">
		<span class="legend-item"><ClassBadge id="evaluator" passed small /><span aria-hidden="true">{m.implement_badge_passed()}</span></span>
		<span class="legend-item"><ClassBadge id="audit" passed={false} small /><span aria-hidden="true">{m.implement_badge_declared()}</span></span>
	</div>
	<p class="note muted"><RichText text={m.implement_list_note()} /></p>
</div>

<style>
	.page {
		padding-block: clamp(28px, 3.9vw, 56px) clamp(56px, 6.7vw, 96px);
	}
	.intro {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px 32px;
		padding-block-end: 28px;
	}
	.intro-text {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.intro .lead {
		max-inline-size: 40em;
	}
	.add {
		flex: none;
		min-block-size: 48px;
		padding-inline: 20px;
		font-size: 16px;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding-block-end: 20px;
	}
	.filter-label {
		margin-inline-end: 4px;
		font-size: 14px;
		color: var(--ms-text-muted);
	}
	.pill {
		min-block-size: 36px;
		padding-inline: 14px;
		border: 1px solid var(--ms-border);
		border-radius: var(--ms-radius-pill);
		background: var(--ms-surface);
		font-size: 14.5px;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
	}
	.pill:hover {
		border-color: var(--ms-border-strong);
	}
	.pill[aria-pressed='true'] {
		border-color: var(--ms-text);
		background: var(--ms-btn-bg);
		color: var(--ms-btn-fg);
	}
	.count {
		font-weight: 400;
		opacity: 0.75;
	}
	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	table {
		inline-size: 100%;
		min-inline-size: 900px;
		border-collapse: collapse;
		font-size: 15px;
	}
	thead th {
		padding: 12px 20px;
		background: var(--ms-surface-2);
		font-size: 14px;
		font-weight: 650;
		text-align: start;
	}
	tbody th,
	tbody td {
		padding: 14px 20px;
		border-block-start: 1px solid var(--ms-border);
		text-align: start;
		vertical-align: middle;
		font-weight: 400;
	}
	thead th:not(:first-child),
	tbody td {
		padding-inline-start: 6px;
	}
	.who {
		display: flex;
		flex-direction: column;
	}
	.name {
		font-weight: 600;
	}
	.origin {
		font-size: 13.5px;
		color: var(--ms-text-muted);
	}
	.small {
		font-size: 13.5px;
	}
	td.small,
	.name {
		white-space: nowrap;
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.run {
		display: inline-block;
		margin-block-start: 6px;
		font-size: 13.5px;
	}
	.open {
		display: grid;
		place-items: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: 8px;
		color: var(--ms-text);
	}
	.open:hover {
		background: var(--ms-surface-2);
	}
	.empty {
		color: var(--ms-text-muted);
	}
	:global([data-empty][hidden]) {
		display: none;
	}
	.cards {
		display: none;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		border: 1px solid var(--ms-border);
		border-radius: 12px;
		background: var(--ms-surface);
	}
	.card[hidden] {
		display: none;
	}
	.card-name {
		font-size: 16px;
		font-weight: 600;
	}
	.card-name a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-block-size: 44px;
		margin-block: -10px -6px;
		color: var(--ms-text);
		text-decoration: none;
	}
	.facts {
		font-size: 14.5px;
		color: var(--ms-text-muted);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 20px;
		margin-block-start: 24px;
		font-size: 14.5px;
		color: var(--ms-text-muted);
	}
	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.note {
		max-inline-size: 60em;
		margin-block-start: 12px;
		font-size: 14.5px;
	}
	@media (max-width: 767px) {
		.intro {
			flex-direction: column;
			align-items: stretch;
			padding-block-end: 16px;
		}
		.add {
			min-block-size: 52px;
			padding-inline: 12px;
			font-size: 15.5px;
		}
		.filters {
			flex-wrap: nowrap;
			overflow-x: auto;
			padding-block-end: 16px;
		}
		.filter-label {
			flex: none;
		}
		.pill {
			flex: none;
			min-block-size: 44px;
		}
		.table-wrap {
			display: none;
		}
		.cards {
			display: flex;
		}
	}
	@media (forced-colors: active) {
		.pill[aria-pressed='true'] {
			border-color: Highlight;
			outline: 2px solid Highlight;
		}
	}
</style>
