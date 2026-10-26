<script lang="ts">
	import TextPageView from '$lib/components/TextPageView.svelte';
	import SubTabs from '$lib/components/implement/SubTabs.svelte';
	import { homeAssistant } from '$lib/content/pages/home-assistant';
</script>

<SubTabs current="implementations" />
<TextPageView page={homeAssistant} />
