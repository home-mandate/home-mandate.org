<script lang="ts">
	// Title and description of one page, for the browser, search engines and
	// link previews (Open Graph). The layout adds what is the same everywhere:
	// og:url, og:image, og:locale. Pages without description are noindex pages.
	let { title, description, noindex = false }: { title: string; description?: string; noindex?: boolean } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:title" content={title} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}
</svelte:head>
