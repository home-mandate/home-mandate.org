<script lang="ts">
	import IdentifierPage from '$lib/components/IdentifierPage.svelte';
	import { spec } from '$lib/generated/spec';
	import { m } from '$lib/paraglide/messages';
</script>

<IdentifierPage name={m.ident_audit()} version="v0" schema={spec.identifiers['audit/v0']} section="91-entries" />
