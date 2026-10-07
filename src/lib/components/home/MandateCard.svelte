<script lang="ts">
	import Decision from '$lib/components/Decision.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { CARD_ROWS, HOME_MANDATE, rowDecision, typeVersion } from '$lib/content/home';
	import { t } from '$lib/content/text';
	import { m } from '$lib/paraglide/messages';

	// The hero card: the rules of the voice-assistant mandate as house rules.
	const rows = CARD_ROWS.map((row) => ({ ...row, decision: rowDecision(HOME_MANDATE, row.rule) }));
	const version = typeVersion(HOME_MANDATE.type);
</script>

<figure class="card" aria-labelledby="mandate-card-name">
	<div class="head">
		<span class="house"><Icon name="household" size={22} /></span>
		<span class="title">
			<span class="label">{m.home_card_label()}</span>
			<span class="name" id="mandate-card-name">{m.home_card_name()}</span>
		</span>
		<span class="version mono">{version}</span>
	</div>
	<ul class="rules">
		{#each rows as row (row.rule)}
			<li data-rule={row.rule}>
				<span class="icon"><Icon name={row.icon} size={21} /></span>
				<span class="text">
					<span class="what">{t(row.text)}</span>
					<span class="note">{t(row.note)}</span>
				</span>
				<Decision value={row.decision} />
			</li>
		{/each}
	</ul>
	<figcaption class="foot">
		<span class="foot-icon"><Icon name="info" size={18} /></span>
		{m.home_card_foot()}
	</figcaption>
</figure>

<style>
	.card {
		margin: 0;
		overflow: hidden;
		background: var(--ms-surface);
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		box-shadow: var(--ms-shadow-2);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		padding-block: 20px;
		padding-inline: 24px;
		border-block-end: 1px solid var(--ms-border);
	}
	.house {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: 10px;
		background: var(--ms-surface-2);
	}
	.title {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-inline-size: 0;
	}
	.label {
		font-size: 13px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ms-text-muted);
	}
	.name {
		font-size: 18px;
		font-weight: 650;
	}
	.version {
		padding-block: 3px;
		padding-inline: 8px;
		border: 1px solid var(--ms-border);
		border-radius: 6px;
		font-size: 12px;
		color: var(--ms-text-muted);
	}
	.rules {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.rules li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding-block: 13px;
		padding-inline: 24px;
		border-block-end: 1px solid var(--ms-border);
	}
	.icon {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 32px;
		block-size: 32px;
		color: var(--ms-text-muted);
	}
	.text {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-inline-size: 0;
	}
	.what {
		font-size: 16px;
		font-weight: 500;
		line-height: 1.35;
	}
	.note {
		font-size: 13.5px;
		line-height: 1.35;
		color: var(--ms-text-muted);
	}
	.foot {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-block: 14px;
		padding-inline: 24px;
		background: var(--ms-surface-2);
		font-size: 14px;
		color: var(--ms-text-muted);
	}
	.foot-icon {
		display: flex;
	}

	@media (max-width: 767.98px) {
		.card {
			border-radius: 14px;
			box-shadow: var(--ms-shadow-1);
		}
		.head {
			gap: 12px;
			padding-block: 14px;
			padding-inline: 16px;
		}
		.house {
			inline-size: 36px;
			block-size: 36px;
			border-radius: 9px;
		}
		.house :global(svg) {
			inline-size: 20px;
			block-size: 20px;
		}
		.label {
			font-size: 12px;
		}
		.name {
			font-size: 17px;
		}
		.version,
		.icon,
		.foot-icon {
			display: none;
		}
		.rules li {
			gap: 12px;
			padding-block: 11px;
			padding-inline: 16px;
		}
		.what {
			font-size: 15.5px;
		}
		.note {
			font-size: 13px;
		}
		.foot {
			padding-block: 12px;
			padding-inline: 16px;
			font-size: 13.5px;
		}
	}
	@media (forced-colors: active) {
		.card {
			border-color: CanvasText;
		}
	}
</style>
