<script lang="ts">
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	// Second navigation level of the Implement section: plain links.
	let { current }: { current: 'implement' | 'implementations' } = $props();

	const locale = $derived(getLocale());
	const tabs = $derived([
		{ id: 'implement', path: '/implement/', label: m.implement_sub_implement() },
		{ id: 'implementations', path: '/implementations/', label: m.implement_sub_implementations() }
	]);
</script>

<nav class="sub" aria-label={m.implement_sub_label()}>
	<ul>
		{#each tabs as tab (tab.id)}
			<li>
				<a href={pathIn(tab.path, locale)} aria-current={tab.id === current ? 'page' : undefined}>{tab.label}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sub {
		border-block-end: 1px solid var(--ms-border);
		background: var(--ms-surface);
	}
	ul {
		display: flex;
		gap: 4px;
		max-inline-size: var(--page-max);
		margin: 0 auto;
		padding: 0;
		padding-inline: var(--header-pad);
		list-style: none;
	}
	a {
		display: flex;
		align-items: center;
		block-size: 52px;
		padding-inline: 16px;
		border-block-end: 2px solid transparent;
		color: var(--ms-text-muted);
		font-size: 15.5px;
		font-weight: 500;
		text-decoration: none;
	}
	a:hover {
		color: var(--ms-text);
	}
	a[aria-current='page'] {
		border-block-end-color: var(--ms-text);
		color: var(--ms-text);
		font-weight: 650;
	}
	a:focus-visible {
		outline-offset: -2px;
	}
	@media (max-width: 767px) {
		ul {
			gap: 0;
			padding-inline: 0;
		}
		li {
			flex: 1;
		}
		a {
			justify-content: center;
			padding-inline: 8px;
			font-size: 14.5px;
		}
	}
	@media (forced-colors: active) {
		a[aria-current='page'] {
			border-block-end-color: CanvasText;
		}
	}
</style>
