<script lang="ts">
	import Icon from '../Icon.svelte';
	import StepNumber from '../StepNumber.svelte';
	import { t } from '$lib/content/text';
	import type { K } from '$lib/content/types';
	import { criticalLabel } from '$lib/how/critical';
	import { ICONS, type IconName } from '$lib/icons';
	import { criticalActions, vocabulary } from '$lib/how/vocabulary';
	import { m } from '$lib/paraglide/messages';

	// The evaluation rule of SPEC-v0 section 4 (and 11.1 for unanswered asks)
	// in five sentences, next to the critical actions of the vocabulary.
	const rules: { icon: IconName; title: string; body: string }[] = [
		{ icon: 'deny', title: m.how_rule_1(), body: m.how_rule_1_body() },
		{ icon: 'layers', title: m.how_rule_2(), body: m.how_rule_2_body() },
		{ icon: 'warning', title: m.how_rule_3(), body: m.how_rule_3_body() },
		{ icon: 'time', title: m.how_rule_4(), body: m.how_rule_4_body() },
		{ icon: 'home', title: m.how_rule_5(), body: m.how_rule_5_body() }
	];
	const critical = criticalActions(vocabulary).map((c) => ({
		...c,
		icon: (c.category in ICONS ? c.category : 'critical') as IconName,
		label: criticalLabel(c, (key) => (key in m ? t(key as K) : undefined))
	}));
</script>

<section class="wrap ground" aria-labelledby="how-rules">
	<div class="rules">
		<h2 id="how-rules">{m.how_rules_title()}</h2>
		<ol>
			{#each rules as rule, i (i)}
				<li>
					<StepNumber n={i + 1} size={36} />
					<span class="ic"><Icon name={rule.icon} size={22} /></span>
					<span class="txt"><strong>{rule.title}</strong><span class="body">{rule.body}</span></span>
				</li>
			{/each}
		</ol>
	</div>
	<aside class="critical" aria-labelledby="how-critical">
		<h3 id="how-critical"><Icon name="critical" size={22} stroke={1.9} />{m.how_crit_title()}</h3>
		<p>{m.how_crit_body()}</p>
		<ul>
			{#each critical as c (c.id)}
				<li><Icon name={c.icon} size={20} /><span class="txt">{c.label}<code>{c.id}</code></span></li>
			{/each}
		</ul>
		<p class="note">{m.how_crit_note()}</p>
	</aside>
</section>

<style>
	.ground {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 48px;
		align-items: start;
		padding-block: clamp(40px, 5.6vw, 80px);
		border-block-start: 1px solid var(--ms-border);
	}
	.rules {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		border-block-start: 1px solid var(--ms-border);
	}
	ol li {
		display: flex;
		gap: 18px;
		padding-block: 20px;
		border-block-end: 1px solid var(--ms-border);
	}
	.ic {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 36px;
		block-size: 36px;
		color: var(--ms-text-muted);
	}
	.txt {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	ol strong {
		font-size: 18px;
		font-weight: 650;
	}
	.body {
		font-size: 16px;
		color: var(--ms-text-muted);
	}
	.critical {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 28px;
		border: 1px solid var(--ms-deny-border);
		border-radius: 16px;
		background: var(--ms-deny-bg);
	}
	h3 {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 21px;
	}
	h3 :global(svg) {
		color: var(--ms-deny-fg);
	}
	.critical p {
		font-size: 16px;
	}
	.critical ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.critical li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--ms-surface);
		font-size: 15.5px;
		line-height: 1.3;
	}
	.critical li .txt {
		gap: 2px;
	}
	.critical code {
		padding: 0;
		background: none;
		font-size: 12px;
		color: var(--ms-text-muted);
	}
	.critical .note {
		font-size: 14.5px;
	}
	@media (max-width: 1023px) {
		.ground {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
		}
	}
	@media (max-width: 767px) {
		.rules {
			gap: 12px;
		}
		ol {
			border-block-start: 0;
		}
		ol li {
			gap: 12px;
			padding-block: 14px;
		}
		.ic {
			display: none;
		}
		ol strong {
			font-size: 17px;
		}
		.body {
			font-size: 15px;
		}
		.critical {
			gap: 10px;
			padding: 18px;
			border-radius: 14px;
		}
		h3 {
			font-size: 18px;
		}
		.critical p {
			font-size: 15px;
		}
		.critical ul {
			grid-template-columns: minmax(0, 1fr);
			gap: 8px;
		}
		.critical li {
			padding: 8px 10px;
			font-size: 15px;
		}
	}
	@media (forced-colors: active) {
		.critical {
			border-color: CanvasText;
		}
	}
</style>
