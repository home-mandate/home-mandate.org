<script lang="ts">
	import { CONTACT_EMAIL } from '$lib/site';

	// The contact address, set in mono like in the design. size: box (aside),
	// large (no-JS box), small (banners).
	let { size = 'box' }: { size?: 'box' | 'large' | 'small' } = $props();
</script>

<a class="mail mono {size}" href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>

<style>
	.mail {
		align-self: flex-start;
		color: var(--ms-accent);
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.box {
		font-size: 16.5px;
	}
	.large {
		margin-block-start: 6px;
		font-size: 19px;
	}
	.small {
		margin-block-start: 4px;
		font-size: 16px;
	}
</style>
