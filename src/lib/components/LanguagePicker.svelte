<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { languages, pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { TRANSLATING_URL } from '$lib/site';

	// <details> works without JavaScript; every entry is a plain link to the same
	// page in that language (the URL is the choice, nothing is stored).
	// "full": globe + name + chevron (desktop header); "icon": globe only (phone
	// header); "row": full-width row inside the mobile menu.
	let { variant = 'full' }: { variant?: 'full' | 'icon' | 'row' } = $props();

	const current = $derived(getLocale());
	const currentName = $derived(languages.find((l) => l.tag === current)?.name ?? current);
</script>

<details class="lang {variant}" data-popover="lang">
	<summary aria-label={variant === 'icon' ? `${m.lang_label()}: ${currentName}` : undefined}>
		<Icon name="globe" size={variant === 'icon' ? 20 : 18} />
		{#if variant !== 'icon'}<span class="name">{currentName}</span><Icon name="chevron" size={variant === 'row' ? 18 : 14} stroke={2} />{/if}
	</summary>
	<div class="panel">
		{#if variant !== 'full'}<p class="title">{m.lang_choose()}</p>{/if}
		<ul>
			{#each languages as language (language.tag)}
				<li>
					<a
						href={pathIn(page.url.pathname, language.tag)}
						hreflang={language.tag}
						aria-current={language.tag === current ? 'true' : undefined}
					>
						<span lang={language.tag} dir={language.dir}>{language.name}</span>
						{#if language.tag === current}
							<Icon name="check" size={18} stroke={2.4} />
						{:else if !language.complete}
							<span class="pct">{m.lang_coverage({ percent: language.coverage })}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
		<a class="translate" href={TRANSLATING_URL}>
			{#if variant !== 'full'}<span class="muted">{m.lang_missing()}</span>{/if}
			{m.lang_help()}<Icon name="external" size={14} /><span class="visually-hidden">{m.common_external()}</span>
		</a>
	</div>
</details>

<style>
	.lang {
		position: relative;
		flex: none;
	}
	summary {
		display: flex;
		align-items: center;
		gap: 8px;
		block-size: 40px;
		padding-inline: 12px;
		border: 1px solid var(--ms-border);
		border-radius: 8px;
		font-size: 15px;
		cursor: pointer;
		list-style: none;
		white-space: nowrap;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary:hover {
		border-color: var(--ms-border-strong);
	}
	[open] > summary {
		background: var(--ms-surface-2);
	}
	.icon summary {
		justify-content: center;
		inline-size: 44px;
		block-size: 44px;
		padding: 0;
		border-radius: var(--ms-radius);
	}
	.row summary {
		block-size: 52px;
		padding-inline: 16px;
		border-color: var(--ms-border-strong);
		border-radius: var(--ms-radius);
		background: var(--ms-surface);
		font-size: 17px;
	}
	.row .name {
		flex: 1;
	}
	.panel {
		position: absolute;
		inset-inline-end: 0;
		inset-block-start: calc(100% + 6px);
		z-index: 20;
		display: flex;
		flex-direction: column;
		min-inline-size: 260px;
		max-block-size: min(70vh, 480px);
		overflow-y: auto;
		background: var(--ms-surface);
		border: 1px solid var(--ms-border);
		border-radius: 12px;
		box-shadow: var(--ms-shadow-2);
	}
	.icon .panel {
		position: fixed;
		inset-inline: 16px;
		inset-block-start: 110px;
	}
	.row .panel {
		position: static;
		margin-block-start: 8px;
		box-shadow: none;
	}
	.title {
		padding: 16px 16px 8px;
		font-size: 19px;
		font-weight: 700;
	}
	ul {
		margin: 0;
		padding: 6px;
		list-style: none;
	}
	ul a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-block-size: 44px;
		padding-inline: 10px;
		border-radius: 8px;
		color: var(--ms-text);
		text-decoration: none;
	}
	ul a:hover {
		background: var(--ms-surface-2);
	}
	ul a[aria-current='true'] {
		background: var(--ms-surface-2);
		font-weight: 650;
	}
	.pct {
		padding: 1px 8px;
		border: 1px solid var(--ms-border-strong);
		border-radius: var(--ms-radius-sm);
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	.translate {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding: 12px 16px;
		border-block-start: 1px solid var(--ms-border);
		color: var(--ms-accent);
		font-size: 14.5px;
		font-weight: 600;
		text-decoration: none;
	}
	.full .translate {
		flex-wrap: nowrap;
		white-space: nowrap;
	}
	.translate .muted {
		inline-size: 100%;
		font-weight: 400;
	}
</style>
