<script lang="ts">
	import TextPageView from '$lib/components/TextPageView.svelte';
	import { faq } from '$lib/content/pages/faq';
	import { t } from '$lib/content/text';
	import { plain } from '$lib/rich';
	import { faqPageLd, jsonLdScript } from '$lib/seo';

	const questions = faq.blocks.flatMap((b) => ('faq' in b ? b.faq : []));
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD from our own texts, "<" escaped -->
	{@html jsonLdScript(faqPageLd(questions.map((item) => ({ q: plain(t(item.q)), a: plain(t(item.a)) }))))}
</svelte:head>

<TextPageView page={faq} />
