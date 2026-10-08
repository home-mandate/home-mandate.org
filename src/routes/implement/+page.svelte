<script lang="ts">
	import CommandLine from '$lib/components/implement/CommandLine.svelte';
	import DownloadCard from '$lib/components/implement/DownloadCard.svelte';
	import ModelBox from '$lib/components/implement/ModelBox.svelte';
	import SubTabs from '$lib/components/implement/SubTabs.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { spec } from '$lib/generated/spec';
	import { conformanceCommands, type CommandId } from '$lib/implement/commands';
	import { CONFORMANCE_CLASSES, type SpecClass } from '$lib/implement/conformance';
	import type { DownloadId } from '$lib/implement/downloads';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(getLocale());
	const tag = spec.latest.tag;

	const CLASS_TEXT: Record<SpecClass, { name: () => string; body: () => string }> = {
		evaluator: { name: m.implement_class_evaluator_name, body: m.implement_class_evaluator_body },
		selection: { name: m.implement_class_selection_name, body: m.implement_class_selection_body },
		signatures: { name: m.implement_class_signatures_name, body: m.implement_class_signatures_body },
		audit: { name: m.implement_class_audit_name, body: m.implement_class_audit_body },
		'audit-anchored': { name: m.implement_class_audit_anchored_name, body: m.implement_class_audit_anchored_body },
		pdp: { name: m.implement_class_pdp_name, body: m.implement_class_pdp_body }
	};
	const COMMAND_LABEL: Record<CommandId, () => string> = {
		install: m.implement_cmd_install,
		exec: m.implement_cmd_exec,
		http: m.implement_cmd_http
	};
	const DOWNLOAD_TEXT: Record<DownloadId, { title: () => string; body: () => string }> = {
		mandate: { title: m.implement_dl_mandate_title, body: m.implement_dl_mandate_body },
		vocabulary: { title: m.implement_dl_vocabulary_title, body: () => m.implement_dl_vocabulary_body({ count: data.categories }) },
		audit: { title: m.implement_dl_audit_title, body: m.implement_dl_audit_body }
	};

	const cases = (c: SpecClass): string => (c === 'pdp' ? m.implement_class_pdp_cases() : m.implement_class_cases({ count: data.counts[c] }));
	const commands = conformanceCommands(spec.repository, tag);
</script>

<svelte:head>
	<title>{m.implement_title()} – {m.site_name()}</title>
	<meta name="description" content={m.implement_intro()} />
</svelte:head>

<SubTabs current="implement" />

<div class="wrap page">
	<header class="intro">
		<h1>{m.implement_title()}</h1>
		<p class="lead">{m.implement_intro()}</p>
	</header>

	<section class="split model" aria-labelledby="model">
		<div class="text">
			<h2 id="model">{m.implement_model_title()}</h2>
			<p class="muted">{m.implement_model_body()}</p>
			<a class="text-link" href={`${pathIn('/spec/v0/', locale)}#3-data-model`}>{m.implement_model_link()} <span aria-hidden="true">→</span></a>
		</div>
		<div class="diagram">
			<ModelBox title={m.implement_model_mandate()} fields={data.model.mandate} primary />
			<div class="link-line">
				<span class="line" aria-hidden="true"></span>
				<span class="mono" aria-hidden="true"><span class="rules-name">rules · </span>{data.model.rules.min}…{data.model.rules.max}</span>
				<span class="visually-hidden">{m.implement_model_relation({ min: data.model.rules.min, max: data.model.rules.max })}</span>
			</div>
			<ModelBox title={m.implement_model_rule()} fields={data.model.rule} />
			<p class="optional">{m.implement_model_optional()}</p>
		</div>
	</section>
</div>

<section class="band" aria-labelledby="classes">
	<div class="wrap">
		<div class="band-head">
			<h2 id="classes">{m.implement_classes_title()}</h2>
			<p class="muted">{m.implement_classes_intro()}</p>
		</div>
		<ul class="classes">
			{#each CONFORMANCE_CLASSES as c (c)}
				<li class="class">
					<div class="class-top">
						<span class="class-id mono">{c}</span>
						<span class="req">{c === 'evaluator' ? m.implement_class_basis() : m.implement_class_optional()}</span>
					</div>
					<h3>{CLASS_TEXT[c].name()}</h3>
					<p class="muted">{CLASS_TEXT[c].body()}</p>
					<p class="cases mono">{cases(c)}</p>
				</li>
			{/each}
		</ul>
		<p class="note muted">{m.implement_classes_note()}</p>
	</div>
</section>

<div class="wrap">
	<section class="split install" aria-labelledby="install">
		<div class="text">
			<h2 id="install">{m.implement_install_title()}</h2>
			<p class="muted">{m.implement_install_body()}</p>
			<p class="muted"><RichText text={m.implement_install_more()} /></p>
		</div>
		<div class="commands">
			{#each commands as c (c.id)}
				<CommandLine id="cmd-{c.id}" label={COMMAND_LABEL[c.id]()} command={c.command} />
			{/each}
		</div>
	</section>
</div>

<section class="downloads" aria-labelledby="downloads">
	<div class="wrap">
		<div class="dl-head">
			<h2 id="downloads">{m.implement_dl_title()}</h2>
			<p class="muted">{m.implement_dl_note()}</p>
		</div>
		<div class="dl-grid">
			{#each data.downloads as d (d.id)}
				<DownloadCard download={d} title={DOWNLOAD_TEXT[d.id].title()} body={DOWNLOAD_TEXT[d.id].body()} version={tag} />
			{/each}
		</div>
	</div>
</section>

<style>
	.page {
		padding-block-start: clamp(28px, 3.9vw, 56px);
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-block-end: clamp(24px, 2.8vw, 40px);
	}
	.intro .lead {
		max-inline-size: 44em;
	}
	h2 {
		font-size: clamp(22px, 1.2rem + 0.4vw, 26px);
		line-height: 1.25;
	}
	.split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
		gap: 48px;
		align-items: start;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.text .text-link {
		align-self: flex-start;
		min-block-size: 44px;
	}
	.model {
		padding-block-end: clamp(32px, 4.5vw, 64px);
	}
	.diagram {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) 56px minmax(0, 1fr);
		align-items: start;
	}
	.link-line {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding-block-start: 150px;
		font-size: 12px;
		color: var(--ms-text-muted);
	}
	.link-line .line {
		align-self: stretch;
		block-size: 2px;
		background: var(--ms-border-strong);
	}
	.rules-name {
		display: none;
	}
	.optional {
		grid-column: 1 / -1;
		margin-block-start: 12px;
		font-size: 13.5px;
		color: var(--ms-text-muted);
	}
	.band {
		padding-block: clamp(32px, 3.9vw, 56px);
		border-block: 1px solid var(--ms-border);
		background: var(--ms-surface);
	}
	.band-head,
	.dl-head {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-block-end: 20px;
	}
	.band-head p {
		max-inline-size: 44em;
	}
	.classes {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.class {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 22px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-bg);
	}
	.class-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.class-id {
		padding: 2px 10px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		font-size: 13px;
	}
	.req {
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	.class h3 {
		font-size: 19px;
		font-weight: 650;
	}
	.class p {
		font-size: 15px;
	}
	.class .cases {
		margin-block-start: auto;
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	.note {
		max-inline-size: 60em;
		margin-block-start: 20px;
		font-size: 14.5px;
	}
	.install {
		padding-block: clamp(32px, 3.9vw, 56px);
	}
	.commands {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-inline-size: 0;
	}
	.downloads {
		padding-block: clamp(32px, 3.9vw, 56px) clamp(56px, 6.7vw, 96px);
		border-block-start: 1px solid var(--ms-border);
	}
	.dl-head {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px 16px;
	}
	.dl-head p {
		font-size: 14.5px;
	}
	.dl-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}
	@media (max-width: 1023px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
		}
		.classes,
		.dl-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767px) {
		.diagram {
			grid-template-columns: minmax(0, 1fr);
		}
		.link-line {
			flex-direction: row;
			align-items: stretch;
			gap: 8px;
			block-size: 32px;
			padding-block: 0;
			padding-inline-start: 24px;
		}
		.link-line .line {
			inline-size: 2px;
			block-size: auto;
			align-self: stretch;
		}
		.link-line .mono {
			align-self: center;
		}
		.rules-name {
			display: inline;
		}
		.classes,
		.dl-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
		.class {
			gap: 6px;
			padding: 16px;
			border-radius: 12px;
		}
		.class h3 {
			font-size: 17px;
		}
		.dl-head {
			flex-direction: column;
		}
	}
</style>
