<script lang="ts">
	import SpecReader from '#lib/components/spec/SpecReader.svelte';

	let { data } = $props();
</script>

<!-- Releases under their tag are not indexed: the latest duplicates /relay/v0/. -->
<SpecReader spec={data.spec} versions={data.versions} file={data.file} doc="relay" noindex />
