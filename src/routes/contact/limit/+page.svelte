<script lang="ts">
	import ResultPage from '$lib/components/contact/ResultPage.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<ResultPage tone="ask" icon="clock" title={m.contact_limit_title()} body={m.contact_limit_page_body()} mail primary="form" />
