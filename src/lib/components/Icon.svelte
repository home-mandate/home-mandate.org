<script lang="ts">
	import { ICONS, MIRRORED, type IconName } from '$lib/icons';

	let {
		name,
		size = 20,
		stroke = 1.75,
		label
	}: { name: IconName; size?: number; stroke?: number; label?: string } = $props();
</script>

<!-- Decorative unless a label is given; a label makes it an image with a name. -->
<svg
	class={{ mirror: MIRRORED.has(name) }}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	focusable="false"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}><path d={ICONS[name]} /></svg>
