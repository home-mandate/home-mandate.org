<script lang="ts">
	import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.notfound_title()} – mandate-spec</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>{m.notfound_title()}</h1>
<p>{m.notfound_body()}</p>
<p><a href="/">{m.common_back_home()}</a></p>
