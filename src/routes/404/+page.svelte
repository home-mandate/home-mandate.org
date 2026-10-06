<script lang="ts">
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.notfound_title()} – {m.site_name()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>{m.notfound_title()}</h1>
<p>{m.notfound_body()}</p>
<p><a href={pathIn('/', getLocale())}>{m.common_back_home()}</a></p>
