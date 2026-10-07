<script lang="ts">
	import ResultPage from '$lib/components/contact/ResultPage.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<ResultPage tone="deny" icon="warn" title={m.contact_invalid_title()} body={m.contact_invalid_page_body()} primary="form" />
