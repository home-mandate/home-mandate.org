<script lang="ts">
	import TextPageView from '$lib/components/TextPageView.svelte';
	import { glossary } from '$lib/content/pages/glossary';
	import { t } from '$lib/content/text';
	import { urlIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { plain } from '$lib/rich';
	import { definedTermSetLd, jsonLdScript } from '$lib/seo';

	// The terms of the glossary also as schema.org data (DefinedTermSet).
	const locale = $derived(getLocale());
	const terms = $derived(
		glossary.blocks.flatMap((b) => ('glossary' in b ? b.glossary : [])).map((e) => ({ term: t(e.term), code: e.code, def: plain(t(e.def)) }))
	);
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD from our own texts, "<" escaped -->
	{@html jsonLdScript(definedTermSetLd({ name: t(glossary.title), url: urlIn('/glossary/', locale), locale, terms }))}
</svelte:head>

<TextPageView page={glossary} />
