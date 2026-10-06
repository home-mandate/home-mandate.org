<script lang="ts">
	import IdentifierPage from '$lib/components/IdentifierPage.svelte';
	import { spec } from '$lib/generated/spec';
	import { m } from '$lib/paraglide/messages';
</script>

<IdentifierPage name={m.ident_mandate()} version="v0" schema={spec.identifiers['mandate/v0']} section="3-data-model" />
