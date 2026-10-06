<script lang="ts">
	import { page } from '$app/state';
	import { languages, pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	const current = $derived(getLocale());
</script>

<!-- <details> works without JavaScript; every entry is a normal link. -->
<details class="language-menu">
	<summary>{m.lang_label()}: {languages.find((l) => l.tag === current)?.name}</summary>
	<ul>
		{#each languages as language (language.tag)}
			<li>
				<a
					href={pathIn(page.url.pathname, language.tag)}
					hreflang={language.tag}
					lang={language.tag}
					dir={language.dir}
					aria-current={language.tag === current ? 'true' : undefined}
					>{language.name}</a
				>
			</li>
		{/each}
	</ul>
</details>

<style>
	.language-menu {
		position: relative;
	}
	summary {
		cursor: pointer;
		padding-block: 0.5rem;
		min-block-size: 44px;
		display: flex;
		align-items: center;
	}
	ul {
		position: absolute;
		inset-inline-end: 0;
		z-index: 1;
		margin: 0;
		padding: 0.5rem;
		list-style: none;
		background: var(--ms-bg);
		border: 1px solid var(--ms-border);
		border-radius: var(--ms-radius);
		min-inline-size: 12rem;
		max-block-size: 60vh;
		overflow-y: auto;
	}
	a {
		display: block;
		padding: 0.5rem 0.75rem;
		min-block-size: 44px;
	}
	a[aria-current='true'] {
		font-weight: 600;
	}
</style>
