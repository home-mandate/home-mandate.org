<script lang="ts">
	import SpecReader from '$lib/components/spec/SpecReader.svelte';

	let { data } = $props();
</script>

<!-- The latest release under its tag duplicates /spec/v0/: not indexed. -->
<SpecReader spec={data.spec} versions={data.versions} file={data.file} noindex={data.latest} />
