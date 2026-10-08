<script lang="ts">
	import ResultPage from '$lib/components/contact/ResultPage.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<ResultPage tone="allow" icon="check" title={m.contact_sent_title()} body={m.contact_sent_body()} primary="home" />
