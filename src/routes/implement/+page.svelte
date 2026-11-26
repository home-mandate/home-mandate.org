<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import OverviewDiagram from '#lib/components/diagrams/OverviewDiagram.svelte';
	import ClassCards from '#lib/components/implement/ClassCards.svelte';
	import DownloadCard from '#lib/components/implement/DownloadCard.svelte';
	import DownloadsSection from '#lib/components/implement/DownloadsSection.svelte';
	import InstallSection from '#lib/components/implement/InstallSection.svelte';
	import ModelBox from '#lib/components/implement/ModelBox.svelte';
	import SubTabs from '#lib/components/implement/SubTabs.svelte';
	import { spec } from '#lib/generated/spec.ts';
	import { conformanceCommands, type CommandId } from '#lib/implement/commands.ts';
	import { CONFORMANCE_CLASSES, type SpecClass } from '#lib/implement/conformance.ts';
	import type { DownloadId } from '#lib/implement/downloads.ts';
	import { pathIn } from '#lib/locale.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
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
		audit: { title: m.implement_dl_audit_title, body: m.implement_dl_audit_body },
		audit_v1: { title: m.implement_dl_audit_v1_title, body: m.implement_dl_audit_v1_body }
	};

	const cases = (c: SpecClass): string => (c === 'pdp' ? m.implement_class_pdp_cases() : m.implement_class_cases({ count: data.counts[c] }));
	const commands = conformanceCommands(spec.repository, tag);
	const classCards = $derived(
		CONFORMANCE_CLASSES.map((c) => ({
			id: c,
			req: c === 'evaluator' ? m.implement_class_basis() : m.implement_class_optional(),
			name: CLASS_TEXT[c].name(),
			body: CLASS_TEXT[c].body(),
			footer: cases(c)
		}))
	);
</script>

<PageMeta title="{m.implement_meta_title()} – {m.site_name()}" description={m.implement_meta_description()} />

<SubTabs current="implement" />

<div class="wrap page">
	<header class="intro">
		<h1>{m.implement_title()}</h1>
		<p class="lead">{m.implement_intro()}</p>
	</header>

	<section class="overview" aria-labelledby="overview">
		<div class="text">
			<h2 id="overview">{m.implement_overview_title()}</h2>
			<p class="muted">{m.implement_overview_body()}</p>
			{#if data.overviewAnchor}
				<a class="text-link" href={`${pathIn('/spec/v0/', locale)}#${data.overviewAnchor}`}>{m.implement_overview_link()} <span aria-hidden="true">→</span></a>
			{/if}
		</div>
		<OverviewDiagram />
	</section>

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

<ClassCards
	id="classes"
	title={m.implement_classes_title()}
	intro={m.implement_classes_intro()}
	classes={classCards}
	note={m.implement_classes_note()}
/>

<InstallSection
	id="install"
	title={m.implement_install_title()}
	body={m.implement_install_body()}
	more={m.implement_install_more()}
	commands={commands.map((c) => ({ ...c, label: COMMAND_LABEL[c.id]() }))}
/>

<DownloadsSection id="downloads" title={m.implement_dl_title()} note={m.implement_dl_note()}>
	{#each data.downloads as d (d.id)}
		<DownloadCard download={d} title={DOWNLOAD_TEXT[d.id].title()} body={DOWNLOAD_TEXT[d.id].body()} version={tag} />
	{/each}
</DownloadsSection>

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
	.overview {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding-block-end: clamp(32px, 4.5vw, 64px);
	}
	.overview .text p {
		max-inline-size: 44em;
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
	@media (max-width: 1023px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
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
	}
</style>
