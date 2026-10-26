<script lang="ts">
	import TextPageView from '$lib/components/TextPageView.svelte';
	import SubTabs from '$lib/components/implement/SubTabs.svelte';
	import { homeAssistant } from '$lib/content/pages/home-assistant';
	import { urlIn } from '$lib/locale';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { breadcrumbLd, jsonLdScript } from '$lib/seo';

	const locale = $derived(getLocale());
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD from our own texts, "<" escaped -->
	{@html jsonLdScript(
		breadcrumbLd([
			{ name: m.site_name(), url: urlIn('/', locale) },
			{ name: m.implement_list_title(), url: urlIn('/implementations/', locale) },
			{ name: 'Home Assistant', url: urlIn('/implementations/home-assistant/', locale) }
		])
	)}
</svelte:head>

<SubTabs current="implementations" />
<TextPageView page={homeAssistant} />
