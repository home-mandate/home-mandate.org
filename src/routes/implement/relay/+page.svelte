<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import RelayDiagram from '#lib/components/diagrams/RelayDiagram.svelte';
	import ClassCards from '#lib/components/implement/ClassCards.svelte';
	import DownloadCard from '#lib/components/implement/DownloadCard.svelte';
	import DownloadsSection from '#lib/components/implement/DownloadsSection.svelte';
	import InstallSection from '#lib/components/implement/InstallSection.svelte';
	import SubTabs from '#lib/components/implement/SubTabs.svelte';
	import RichText from '#lib/components/RichText.svelte';
	import { relay } from '#lib/generated/relay.ts';
	import { modulePath } from '#lib/implement/commands.ts';
	import { pathIn } from '#lib/locale.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	// /implement/relay/: the Relay Specification for those who build an operator
	// or a gateway. Everything with a number comes from the imported release.
	let { data }: PageProps = $props();

	const locale = $derived(getLocale());
	const tag = relay.latest.tag;
	const module = modulePath(relay.repository);

	// RELAY-v0 Section 8.1: an operator conforms if it passes all five classes.
	const CLASSES = [
		{ id: 'metadata', name: m.relay_class_metadata_name, body: m.relay_class_metadata_body, sections: '3, 7.1, 7.3' },
		{ id: 'enrollment', name: m.relay_class_enrollment_name, body: m.relay_class_enrollment_body, sections: '5, 6.4' },
		{ id: 'dns', name: m.relay_class_dns_name, body: m.relay_class_dns_body, sections: '5.6, 5.7, 6.3' },
		{ id: 'relay', name: m.relay_class_relay_name, body: m.relay_class_relay_body, sections: '4, 6.1, 6.8' },
		{ id: 'issuance', name: m.relay_class_issuance_name, body: m.relay_class_issuance_body, sections: '5.6, 6.3, 6.6, 6.7' }
	];
	const classCards = $derived(
		CLASSES.map((c) => ({ id: c.id, req: m.relay_impl_required(), name: c.name(), body: c.body(), footer: m.relay_impl_sections({ sections: c.sections }) }))
	);
	const COMMANDS = [
		{ id: 'install', label: m.relay_cmd_install, command: `go install ${module}/cmd/relay-conformance@${tag}` },
		{ id: 'list', label: m.relay_cmd_list, command: 'relay-conformance -list' },
		{ id: 'help', label: m.relay_cmd_help, command: 'relay-conformance -help' }
	];
	const DOWNLOAD_TEXT = {
		metadata: { title: m.relay_dl_metadata_title, body: m.relay_dl_metadata_body },
		enrollment: { title: m.relay_dl_enrollment_title, body: m.relay_dl_enrollment_body }
	};
</script>

<PageMeta title="{m.relay_impl_meta_title()} – {m.site_name()}" description={m.relay_impl_meta_description()} />

<SubTabs current="relay" />

<div class="wrap page">
	<header class="intro">
		<p class="eyebrow">{m.relay_impl_eyebrow({ version: tag })}</p>
		<h1>{m.relay_impl_title()}</h1>
		<p class="lead">{m.relay_impl_intro({ core: relay.requires })}</p>
		<div class="actions">
			<a class="btn btn-primary" href={pathIn('/relay/v0/', locale)}>{m.relay_impl_read({ version: tag })}</a>
			<a class="btn btn-secondary" href={`${relay.repository}/releases/tag/${tag}`}>{m.relay_impl_release()}<span class="visually-hidden">{m.common_external()}</span></a>
		</div>
	</header>

	<section class="overview" aria-labelledby="relay-overview">
		<div class="text">
			<h2 id="relay-overview">{m.relay_impl_overview_title()}</h2>
			<p class="muted">{m.relay_impl_overview_body()}</p>
			<a class="text-link" href={`${pathIn('/relay/v0/', locale)}#12-overview-informative`}>{m.relay_impl_overview_link()} <span aria-hidden="true">→</span></a>
		</div>
		<RelayDiagram />
	</section>

	<section class="roles" aria-labelledby="relay-roles">
		<h2 id="relay-roles" class="visually-hidden">{m.relay_impl_roles_title()}</h2>
		<article class="role">
			<p class="eyebrow">{m.relay_impl_operator_eyebrow()}</p>
			<h3>{m.relay_impl_operator_title()}</h3>
			<p class="muted"><RichText text={m.relay_impl_operator_body()} /></p>
		</article>
		<article class="role">
			<p class="eyebrow">{m.relay_impl_gateway_eyebrow()}</p>
			<h3>{m.relay_impl_gateway_title()}</h3>
			<p class="muted"><RichText text={m.relay_impl_gateway_body()} /></p>
		</article>
	</section>
</div>

<ClassCards
	id="relay-classes"
	title={m.relay_impl_classes_title()}
	intro={m.relay_impl_classes_intro()}
	classes={classCards}
	note={m.relay_impl_classes_note()}
>
	{#snippet extra()}
		<li class="summary dashed">
			<p class="big mono">{data.cases}</p>
			<p>{m.relay_impl_cases({ files: data.files })}</p>
			<a class="text-link" href={`${pathIn('/relay/v0/', locale)}#82-cases`}>{m.relay_impl_cases_link()} <span aria-hidden="true">→</span></a>
		</li>
	{/snippet}
</ClassCards>

<InstallSection
	id="relay-test"
	title={m.relay_impl_test_title()}
	body={m.relay_impl_test_body()}
	more={m.relay_impl_test_more()}
	commands={COMMANDS.map((c) => ({ ...c, label: c.label() }))}
	prefix="relay-cmd"
/>

<DownloadsSection id="relay-downloads" title={m.implement_dl_title()} note={m.relay_dl_note()}>
	{#each data.downloads as d (d.id)}
		<DownloadCard download={d} title={DOWNLOAD_TEXT[d.id].title()} body={DOWNLOAD_TEXT[d.id].body()} version={tag} />
	{/each}
	<a class="dl-more" href={pathIn('/relay/errors/', locale)}>
		<span class="mono">/relay/errors/</span>
		<strong>{m.relay_dl_errors_title()}</strong>
		<span class="muted">{m.relay_dl_errors_body()}</span>
	</a>
</DownloadsSection>

<style>
	.page {
		padding-block-start: clamp(28px, 3.9vw, 56px);
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-block-end: clamp(24px, 2.8vw, 40px);
	}
	.intro .lead {
		max-inline-size: 44em;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-block-start: 8px;
	}
	h2 {
		font-size: clamp(22px, 1.2rem + 0.4vw, 26px);
		line-height: 1.25;
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
		padding-block-end: clamp(32px, 4.5vw, 56px);
	}
	.overview .text p {
		max-inline-size: 44em;
	}
	.roles {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		padding-block-end: clamp(32px, 4.5vw, 64px);
	}
	.role {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 22px 24px;
		border-inline-start: 3px solid var(--ms-accent);
		border-radius: 0 14px 14px 0;
		background: var(--ms-surface);
	}
	.role h3 {
		font-size: 20px;
		font-weight: 650;
	}
	.summary .big {
		font-size: 40px;
		font-weight: 650;
		line-height: 1;
		color: var(--ms-accent);
	}
	.summary .text-link {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		min-block-size: 44px;
	}
	.dl-more {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		border: 1px dashed var(--ms-border-strong);
		border-radius: 14px;
		color: var(--ms-text);
		text-decoration: none;
	}
	.dl-more:hover {
		border-color: var(--ms-accent);
	}
	.dl-more .mono {
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	.dl-more strong {
		font-size: 17px;
	}
	.dl-more .muted {
		font-size: 15px;
	}
	@media (max-width: 767px) {
		.roles {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
	}
</style>
