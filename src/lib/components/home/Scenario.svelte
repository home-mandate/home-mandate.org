<script lang="ts">
	import Decision from '$lib/components/Decision.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import StepNumber from '$lib/components/StepNumber.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

{#snippet agent()}
	<span class="node"><span class="shape round"><Icon name="agent" size={24} /></span>{m.home_node_agent()}</span>
{/snippet}
{#snippet home()}
	<span class="node"><span class="shape square"><Icon name="household" size={24} /></span>{m.home_node_home()}</span>
{/snippet}
{#snippet line()}
	<span class="line"></span>
{/snippet}

<section class="section scenario" aria-labelledby="scenario-title">
	<div class="wrap">
		<div class="section-head">
			<h2 id="scenario-title">{m.home_scenario_title()}</h2>
			<p class="lead">{m.home_scenario_lead()}</p>
		</div>
		<ol class="steps">
			<li>
				<div class="frame">
				<div class="scene" role="img" aria-label={m.home_step1_alt()}>
					{@render agent()}{@render line()}{@render home()}{@render line()}
					<span class="node"><span class="result"><Decision value="allow" /></span>{m.home_node_light()}</span>
				</div></div>
				<div class="step">
					<StepNumber n={1} />
					<div class="step-text">
						<h3>{m.home_step1_title()}</h3>
						<p>{m.home_step1_body()}</p>
					</div>
				</div>
			</li>
			<li>
				<div class="frame">
				<div class="scene tall" role="img" aria-label={m.home_step2_alt()}>
					{@render agent()}{@render line()}{@render home()}{@render line()}
					<span class="phone">
						<span class="phone-ask"><Icon name="ask" size={13} stroke={2.6} />{m.common_ask()}</span>
						<span class="phone-q">{m.home_phone_question()}</span>
						<span class="phone-yes">{m.home_phone_yes()}</span>
						<span class="phone-no">{m.home_phone_no()}</span>
					</span>
				</div></div>
				<div class="step">
					<StepNumber n={2} />
					<div class="step-text">
						<h3>{m.home_step2_title()}</h3>
						<p>{m.home_step2_body()}</p>
					</div>
				</div>
			</li>
			<li>
				<div class="frame">
				<div class="scene four" role="img" aria-label={m.home_step3_alt()}>
					<span class="node"><span class="shape mail"><Icon name="mail" size={22} /></span>{m.home_node_mail()}</span>
					{@render line()}{@render agent()}{@render line()}{@render home()}{@render line()}
					<span class="node"><span class="result"><Decision value="deny" /></span>{m.home_node_alarm()}</span>
				</div></div>
				<div class="step">
					<StepNumber n={3} />
					<div class="step-text">
						<h3>{m.home_step3_title()}</h3>
						<p>{m.home_step3_body()}</p>
					</div>
				</div>
			</li>
		</ol>
	</div>
</section>

<style>
	.scenario {
		background: var(--ms-surface);
		border-block: 1px solid var(--ms-border);
	}
	.steps {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.frame {
		container: scene / inline-size;
	}
	.scene {
		--node: 52px;
		--line: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
		block-size: 200px;
		padding-inline: 8px;
		border-radius: 16px;
		background: var(--ms-bg);
		border: 1px solid var(--ms-border);
	}
	.tall {
		--line: 20px;
	}
	.four {
		--line: 16px;
		gap: 10px;
	}
	.node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		line-height: 1.3;
		text-align: center;
		color: var(--ms-text-muted);
	}
	.shape {
		display: grid;
		place-items: center;
		inline-size: var(--node);
		block-size: var(--node);
		background: var(--ms-surface-2);
		color: var(--ms-text);
	}
	.round {
		border-radius: 50%;
	}
	.square {
		border-radius: 12px;
	}
	.mail {
		inline-size: 44px;
		block-size: 44px;
		border: 1.5px dashed var(--ms-deny-border);
		border-radius: 10px;
		background: none;
	}
	.line {
		flex: none;
		inline-size: var(--line);
		block-size: 2px;
		margin-block-end: 24px;
		background: var(--ms-border-strong);
	}
	.result :global(.chip) {
		block-size: var(--node);
		padding-inline: 10px 14px;
		font-size: 15px;
		font-weight: 650;
	}
	.result :global(.chip svg) {
		inline-size: 18px;
		block-size: 18px;
	}
	.phone {
		display: flex;
		flex-direction: column;
		gap: 7px;
		inline-size: 122px;
		padding-block: 12px 10px;
		padding-inline: 10px;
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 16px;
		background: var(--ms-surface);
		font-size: 11px;
	}
	.phone-ask {
		display: flex;
		align-items: center;
		gap: 5px;
		font-weight: 650;
		color: var(--ms-ask-fg);
	}
	.phone-q {
		font-size: 12px;
		line-height: 1.3;
		font-weight: 600;
	}
	.phone-yes,
	.phone-no {
		display: grid;
		place-items: center;
		block-size: 24px;
		border-radius: 6px;
	}
	.phone-yes {
		background: var(--ms-btn-bg);
		color: var(--ms-btn-fg);
		font-weight: 650;
	}
	.phone-no {
		border: 1px solid var(--ms-border);
	}
	.step {
		display: flex;
		gap: 16px;
	}
	.step-text {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.step-text p {
		color: var(--ms-text-muted);
	}

	/* Three columns only where the widest scene (four nodes) fits. */
	@media (max-width: 1199.98px) {
		.steps {
			grid-template-columns: minmax(0, 1fr);
			gap: 28px;
		}
		li {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: center;
			gap: 24px;
		}
	}
	@media (max-width: 767.98px) {
		li {
			display: flex;
			align-items: stretch;
			gap: 14px;
		}
		.scene {
			block-size: 150px;
			border-radius: 14px;
		}
		.tall {
			block-size: 170px;
		}
		.step {
			gap: 12px;
		}
		.step-text {
			gap: 4px;
		}
		.step-text p {
			font-size: 16px;
		}
	}
	/* Compact nodes when the scene is narrow (phones, two-column tablets). */
	@container scene (max-width: 379.98px) {
		.scene {
			--node: 46px;
			--line: 18px;
			gap: 8px;
		}
		.tall {
			--line: 14px;
		}
		.four {
			--node: 44px;
			--line: 10px;
			gap: 5px;
		}
		.node {
			gap: 6px;
			font-size: 12px;
		}
		.shape :global(svg) {
			inline-size: 20px;
			block-size: 20px;
		}
		.mail {
			inline-size: 40px;
			block-size: 40px;
			border-radius: 9px;
		}
		.line {
			margin-block-end: 22px;
		}
		.result :global(.chip) {
			padding-inline: 8px 11px;
			font-size: 13.5px;
		}
		.result :global(.chip svg) {
			inline-size: 15px;
			block-size: 15px;
		}
		.phone {
			gap: 6px;
			inline-size: 118px;
			padding-block: 10px 9px;
			padding-inline: 9px;
			border-radius: 14px;
		}
		.phone-yes,
		.phone-no {
			block-size: 22px;
		}
	}
	@media (forced-colors: active) {
		.scene,
		.phone,
		.shape {
			border: 1px solid CanvasText;
		}
		.line {
			background: CanvasText;
		}
	}
</style>
