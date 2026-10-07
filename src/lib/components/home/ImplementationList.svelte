<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { implementationRows } from '$lib/content/home';
	import { IMPLEMENTATIONS, type ImplementationKind } from '$lib/content/implementations';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { SITE_REPOSITORY } from '$lib/site';

	// The first implementations of the list; conformance classes count as
	// "passed" only with a published conformance run, otherwise as declared.
	const rows = implementationRows(IMPLEMENTATIONS);
	const kindNames: Record<ImplementationKind, () => string> = {
		guard: m.home_impl_kind_guard,
		integration: m.home_impl_kind_integration,
		library: m.home_impl_kind_library,
		tool: m.home_impl_kind_tool
	};
	const kinds = (list: ImplementationKind[]) => list.map((k) => kindNames[k]()).join(' · ');
</script>

<section class="section impl" aria-labelledby="impl-title">
	<div class="wrap layout">
		<h2 id="impl-title">{m.home_impl_title()}</h2>
		<div class="table">
			<ul>
				{#each rows as row (row.name)}
					<li>
						<a href={row.url}>
							<span class="name">
								<span class="mono">{row.name}</span>
								<span class="kind">{kinds(row.kinds)}</span>
							</span>
							<span class="meta">{row.meta}</span>
							<span class="classes" class:passed={row.passed}>
								<Icon name={row.passed ? 'ok' : 'clock'} size={16} />
								<span class="visually-hidden"
									>{m.home_impl_classes()} ({row.passed ? m.home_impl_passed() : m.home_impl_declared()}):</span
								>
								{#each row.classes as cls (cls)}<span class="badge mono">{cls}</span>{/each}
							</span>
							<span class="go"><Icon name="arrow-up-right" /><span class="visually-hidden">{m.common_external()}</span></span>
						</a>
					</li>
				{/each}
			</ul>
			<p class="add">{m.home_impl_add()} <a href={SITE_REPOSITORY}>{m.home_impl_pr()}</a></p>
		</div>
		<a class="text-link all" href={pathIn('/implementations/', getLocale())}
			>{m.home_impl_all()}<Icon name="arrow" size={18} stroke={2} /></a
		>
	</div>
</section>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas:
			'title all'
			'table table';
		align-items: end;
		row-gap: 32px;
		column-gap: 24px;
	}
	h2 {
		grid-area: title;
	}
	.all {
		grid-area: all;
		min-block-size: 44px;
	}
	.table {
		grid-area: table;
		overflow: hidden;
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		background: var(--ms-surface);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li a {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.2fr) 24px;
		align-items: center;
		gap: 24px;
		padding-block: 22px;
		padding-inline: 28px;
		border-block-end: 1px solid var(--ms-border);
		color: var(--ms-text);
		text-decoration: none;
	}
	li a:hover {
		background: var(--ms-surface-2);
	}
	li a:focus-visible {
		outline-offset: -3px;
	}
	.name {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.name .mono {
		font-size: 17px;
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.kind,
	.meta {
		font-size: 15px;
		color: var(--ms-text-muted);
	}
	.classes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		color: var(--ms-text-muted);
	}
	.badge {
		padding-block: 3px;
		padding-inline: 10px;
		border: 1px dashed var(--ms-border-strong);
		border-radius: 6px;
		font-size: 12.5px;
	}
	.passed {
		color: var(--ms-allow-fg);
	}
	.passed .badge {
		border-style: solid;
		border-color: var(--ms-allow-border);
		color: var(--ms-text);
	}
	.go {
		display: flex;
	}
	.add {
		padding-block: 16px;
		padding-inline: 28px;
		font-size: 15px;
		color: var(--ms-text-muted);
	}

	@media (max-width: 1023.98px) {
		li a {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 24px;
		}
		.meta {
			grid-column: 1;
			grid-row: 2;
		}
		.classes {
			grid-column: 2;
			grid-row: 1 / span 2;
		}
		.go {
			grid-column: 3;
			grid-row: 1 / span 2;
		}
		li a {
			row-gap: 4px;
		}
	}
	@media (max-width: 767.98px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'title'
				'table'
				'all';
			row-gap: 16px;
		}
		.table {
			border-radius: 14px;
		}
		li a {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 6px 8px;
			padding: 16px;
		}
		.name,
		.meta,
		.classes {
			grid-column: 1 / -1;
			grid-row: auto;
		}
		.name {
			grid-column: 1;
			grid-row: 1;
		}
		.name .mono {
			font-size: 16px;
		}
		.go {
			grid-column: 2;
			grid-row: 1;
			align-self: start;
		}
		.badge {
			padding-block: 2px;
			padding-inline: 9px;
			font-size: 12px;
		}
		.add {
			padding-block: 14px;
			padding-inline: 16px;
		}
	}
	@media (forced-colors: active) {
		.table {
			border-color: CanvasText;
		}
	}
</style>
