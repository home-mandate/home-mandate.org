<script lang="ts">
	import SpecReader from '$lib/components/spec/SpecReader.svelte';

	let { data } = $props();
</script>

<SpecReader spec={data.spec} versions={data.versions} file={data.file} />
