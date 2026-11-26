<script lang="ts">
	import ChangelogPage from '#lib/components/changelog/ChangelogPage.svelte';

	let { data } = $props();
</script>

<ChangelogPage notes={data.notes} doc="relay" />
