<script lang="ts">
	import type { Field } from '$lib/implement/model';
	import { m } from '$lib/paraglide/messages';

	// One type of the data model as a two-column table: field and type.
	let { title, fields, primary = false }: { title: string; fields: Field[]; primary?: boolean } = $props();
</script>

<div class="box" class:primary>
	<table>
		<caption>{title}</caption>
		<thead class="visually-hidden">
			<tr><th scope="col">{m.implement_model_field()}</th><th scope="col">{m.implement_model_type()}</th></tr>
		</thead>
		<tbody>
			{#each fields as field (field.name)}
				<tr>
					<th scope="row" class="mono">{field.name}</th>
					<td class="mono">{field.type}{field.optional ? '?' : ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.box {
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 12px;
		background: var(--ms-surface);
		overflow: hidden;
	}
	.box.primary {
		border-color: var(--ms-text);
	}
	table {
		inline-size: 100%;
		border-collapse: collapse;
	}
	caption {
		padding: 10px 14px;
		border-block-end: 1px solid var(--ms-border);
		font-weight: 650;
		text-align: start;
	}
	tbody tr + tr {
		border-block-start: 1px solid var(--ms-border);
	}
	th,
	td {
		padding-block: 7px;
		font-size: 13.5px;
		line-height: 1.45;
		font-weight: 400;
		vertical-align: baseline;
	}
	th {
		padding-inline: 14px 8px;
		text-align: start;
		white-space: nowrap;
	}
	td {
		padding-inline: 8px 14px;
		color: var(--ms-text-muted);
		text-align: end;
		overflow-wrap: break-word;
	}
	@media (max-width: 767px) {
		caption {
			padding: 9px 12px;
		}
		th,
		td {
			padding-block: 6px;
			font-size: 13px;
		}
		th {
			padding-inline-start: 12px;
		}
		td {
			padding-inline-end: 12px;
		}
	}
	@media (forced-colors: active) {
		.box {
			border-color: CanvasText;
		}
	}
</style>
