<script lang="ts">
	import ResultPage from '$lib/components/contact/ResultPage.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<ResultPage tone="deny" icon="warn" title={m.contact_failed_title()} body={m.contact_failed_page_body()} mail primary="form" />
