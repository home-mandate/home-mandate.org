<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import LanguagePicker from './LanguagePicker.svelte';
	import Logo from './Logo.svelte';
	import ThemeSwitch from './ThemeSwitch.svelte';
	import { basePath, pathIn } from '$lib/locale';
	import { NAV, activeNav, type NavId } from '$lib/nav';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { SPEC_REPOSITORY } from '$lib/site';

	const labels: Record<NavId, () => string> = {
		why: m.nav_why,
		how: m.nav_how,
		playground: m.nav_playground,
		implement: m.nav_implement,
		spec: m.nav_spec,
		faq: m.nav_faq
	};
	const locale = $derived(getLocale());
	const active = $derived(activeNav(basePath(page.url.pathname)));
</script>

<header class="header">
	<a class="home" href={pathIn('/', locale)} aria-label={m.nav_home()}><Logo /></a>

	<nav class="desktop" aria-label={m.nav_main()}>
		{#each NAV as item (item.id)}
			<a href={pathIn(item.path, locale)} aria-current={active === item.id ? 'page' : undefined}>{labels[item.id]()}</a>
		{/each}
	</nav>

	<div class="tools desktop">
		<a class="github" href={SPEC_REPOSITORY}><Icon name="github" size={18} /><span class="github-word">{m.nav_github()}</span></a>
		<LanguagePicker />
		<ThemeSwitch group="theme-header" />
	</div>

	<div class="tools mobile">
		<LanguagePicker variant="icon" />
		<details class="menu" data-popover="menu">
			<summary>
				<span class="when-closed"><Icon name="menu" stroke={2} /><span class="word">{m.nav_menu()}</span></span>
				<span class="when-open"><Icon name="close" stroke={2} /><span class="word">{m.nav_close()}</span></span>
			</summary>
			<div class="menu-panel">
				<nav aria-label={m.nav_main()}>
					{#each NAV as item (item.id)}
						<a class="entry" href={pathIn(item.path, locale)} aria-current={active === item.id ? 'page' : undefined}>
							{labels[item.id]()}<Icon name="arrow" />
						</a>
					{/each}
					<a class="entry github-row" href={SPEC_REPOSITORY}>
						<Icon name="github" />{m.nav_github()}<Icon name="external" size={16} /><span class="visually-hidden">{m.common_external()}</span>
					</a>
				</nav>
				<div class="menu-group">
					<p class="menu-label">{m.lang_label()}</p>
					<LanguagePicker variant="row" />
				</div>
				<div class="menu-group">
					<ThemeSwitch group="theme-menu" variant="segments" />
				</div>
			</div>
		</details>
	</div>
</header>

<style>
	.header {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 16px;
		block-size: 76px;
		max-inline-size: var(--page-max);
		margin-inline: auto;
		padding-inline: var(--header-pad);
	}
	.header::after {
		content: '';
		position: absolute;
		inset-inline: calc(50% - 50vw);
		inset-block-end: 0;
		border-block-end: 1px solid var(--ms-border);
	}
	.home {
		display: flex;
		flex: none;
		color: var(--ms-text);
		text-decoration: none;
		border-radius: 8px;
	}
	nav.desktop {
		display: flex;
		margin-inline-start: 16px;
		min-inline-size: 0;
	}
	nav.desktop a {
		flex: none;
		padding: 8px 10px;
		border-radius: 8px;
		color: var(--ms-text);
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		white-space: nowrap;
	}
	nav.desktop a:hover {
		background: var(--ms-surface-2);
	}
	nav.desktop a[aria-current='page'] {
		background: var(--ms-surface-2);
		box-shadow: inset 0 -2px 0 var(--ms-text);
	}
	.tools {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-inline-start: auto;
	}
	.github {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 8px;
		color: var(--ms-text);
		text-decoration: none;
		font-size: 15px;
	}
	.github:hover {
		background: var(--ms-surface-2);
	}
	.mobile {
		display: none;
	}

	.menu summary {
		display: flex;
		align-items: center;
		block-size: 44px;
		padding-inline: 12px 14px;
		border: 1px solid var(--ms-border-strong);
		border-radius: var(--ms-radius);
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}
	.menu summary::-webkit-details-marker {
		display: none;
	}
	.menu summary span {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.menu[open] summary {
		background: var(--ms-surface-2);
	}
	.menu:not([open]) .when-open,
	.menu[open] .when-closed {
		display: none !important;
	}
	.menu-panel {
		position: absolute;
		inset-inline: 0;
		inset-block-start: 100%;
		z-index: 30;
		display: flex;
		flex-direction: column;
		gap: 28px;
		min-block-size: 100dvh;
		padding: 8px 16px 32px;
		background: var(--ms-bg);
	}
	.menu-panel nav {
		display: flex;
		flex-direction: column;
	}
	.entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-block-size: 56px;
		border-block-end: 1px solid var(--ms-border);
		color: var(--ms-text);
		text-decoration: none;
		font-size: 19px;
		font-weight: 600;
	}
	.entry :global(svg) {
		color: var(--ms-text-muted);
	}
	.entry[aria-current='page'] {
		box-shadow: inset 3px 0 0 var(--ms-text);
		padding-inline-start: 12px;
	}
	.github-row {
		justify-content: flex-start;
		gap: 10px;
		font-size: 17px;
		font-weight: 400;
	}
	.github-row :global(svg:last-of-type) {
		margin-inline-start: auto;
	}
	.menu-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.menu-label {
		font-size: 14px;
		font-weight: 650;
		color: var(--ms-text-muted);
	}

	/* Very narrow phones: the menu button keeps only its icon (the word stays for screen readers). */
	@media (max-width: 359px) {
		.menu summary {
			padding-inline: 10px;
		}
		.menu .word {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		.header {
			gap: 8px;
		}
	}
	/* Between the menu breakpoint and wide screens the navigation needs the room: GitHub keeps
	   only its icon, the word stays for screen readers. */
	@media (max-width: 1439px) {
		.github-word {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		nav.desktop a {
			padding-inline: 8px;
		}
	}
	@media (max-width: 1239px) {
		.header {
			block-size: 64px;
			gap: 12px;
		}
		.desktop {
			display: none !important;
		}
		.mobile {
			display: flex;
		}
	}
</style>
