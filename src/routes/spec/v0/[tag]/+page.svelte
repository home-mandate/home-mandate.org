<script lang="ts">
	import SpecReader from '$lib/components/spec/SpecReader.svelte';

	let { data } = $props();
</script>

<!-- Releases under their tag are not indexed: the latest duplicates /spec/v0/,
     older ones are nearly the same text. They stay reachable and followed. -->
<SpecReader spec={data.spec} versions={data.versions} file={data.file} noindex />
