<script lang="ts">
	// header: mark and name. footer: mark, name and tagline (the tagline is the
	// home title, so the header leaves it out).
	let { variant = 'header' }: { variant?: 'header' | 'footer' } = $props();

	const file = $derived(variant === 'footer' ? 'lockup-tagline' : 'lockup');
	// The header link carries the name; the footer image stands alone. Its text is
	// English in every language, like the image.
	const alt = $derived(variant === 'footer' ? 'Home-Mandate – AI is coming home. Decide what it may do.' : '');
	// Aspect ratio of both files (viewBox), so the page does not shift while they load.
	const width = $derived(variant === 'footer' ? 1764 : 1758);
	const height = 423;
</script>

<!-- House with key. Both variants are in the markup; the tokens show one of them,
     by the theme switch and by the system setting, without a flash. -->
<img class="logo {variant} light" src="/logo/{file}-light.svg" {alt} lang="en" {width} {height} />
<img class="logo {variant} dark" src="/logo/{file}-dark.svg" {alt} lang="en" {width} {height} />

<style>
	.logo {
		inline-size: auto;
		max-inline-size: 100%;
	}
	.light {
		display: var(--ms-logo-light, block);
	}
	.dark {
		display: var(--ms-logo-dark, none);
	}
	/* The original proportions: the name is about 30 % of the height. */
	.header {
		block-size: 48px;
	}
	.footer {
		block-size: 88px;
	}
	/* The header's menu breakpoint (SiteHeader.svelte): a 64 px bar. */
	@media (max-width: 1239px) {
		.header {
			block-size: 40px;
		}
	}
	@media (max-width: 767px) {
		.footer {
			block-size: auto;
			inline-size: 340px;
		}
	}
</style>
