<script lang="ts">
	// Title and description of one page, for the browser, search engines and
	// link previews (Open Graph). The layout adds what is the same everywhere:
	// og:url, og:image, og:locale. Pages without description are noindex pages.
	// An article (a release of the specification) names the date of its last change.
	let {
		title,
		description,
		noindex = false,
		type = 'website',
		modified
	}: { title: string; description?: string; noindex?: boolean; type?: 'website' | 'article'; modified?: string } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:title" content={title} />
	<meta property="og:type" content={type} />
	{#if type === 'article' && modified}<meta property="article:modified_time" content={modified} />{/if}
	{#if noindex}<meta name="robots" content="noindex" />{/if}
</svelte:head>
