<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	let { title, body }: { title: string; body: string } = $props();
</script>

<svelte:head>
	<title>{title} – {m.site_name()}</title>
</svelte:head>

<article>
	<h1>{title}</h1>
	<p>{body}</p>
</article>

<style>
	article {
		max-inline-size: var(--ms-measure);
	}
</style>
