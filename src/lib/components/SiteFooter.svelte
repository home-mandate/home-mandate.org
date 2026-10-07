<script lang="ts">
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import { languages, pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { SECURITY_URL, SITE_REPOSITORY, SPEC_REPOSITORY, TRANSLATING_URL } from '$lib/site';

	// "full" (home page): four columns. "compact" (all other pages): one row.
	let { variant = 'compact' }: { variant?: 'full' | 'compact' } = $props();

	const locale = $derived(getLocale());
	const local = (path: string) => pathIn(path, locale);
</script>

<footer class="footer {variant}" aria-label={m.footer_label()}>
	{#if variant === 'full'}
		<div class="wrap grid">
			<div class="about">
				<Logo size={26} />
				<p class="muted">{m.footer_license()}</p>
			</div>
			<div class="col">
				<p class="eyebrow">{m.footer_project()}</p>
				<a href={SPEC_REPOSITORY}>{m.nav_github()}</a>
				<a href={local('/changelog/')}>{m.footer_changelog()}</a>
				<a href={SECURITY_URL}>{m.footer_security()}</a>
				<a href={SITE_REPOSITORY}>{m.footer_source()}</a>
			</div>
			<div class="col">
				<p class="eyebrow">{m.footer_legal()}</p>
				<a href={local('/contact/')}>{m.footer_contact()}</a>
				<a href={local('/imprint/')}>{m.footer_imprint()}</a>
				<a href={local('/privacy/')}>{m.footer_privacy()}</a>
			</div>
			<div class="col">
				<p class="eyebrow">{m.footer_language()}</p>
				{#each languages as language (language.tag)}
					<a
						href={pathIn(page.url.pathname, language.tag)}
						hreflang={language.tag}
						lang={language.tag}
						dir={language.dir}
						aria-current={language.tag === locale ? 'true' : undefined}>{language.name}</a
					>
				{/each}
				<a href={TRANSLATING_URL}>{m.footer_translate()}</a>
			</div>
		</div>
	{:else}
		<div class="wrap row">
			<p class="muted">{m.footer_license()}</p>
			<ul>
				<li><a href={SPEC_REPOSITORY}>{m.nav_github()}</a></li>
				<li><a href={local('/contact/')}>{m.footer_contact()}</a></li>
				<li><a href={local('/changelog/')}>{m.footer_changelog()}</a></li>
				<li><a href={local('/imprint/')}>{m.footer_imprint()}</a></li>
				<li><a href={local('/privacy/')}>{m.footer_privacy()}</a></li>
				<li><a href={SECURITY_URL}>{m.footer_security()}</a></li>
			</ul>
		</div>
	{/if}
</footer>

<style>
	.footer {
		border-block-start: 1px solid var(--ms-border);
		background: var(--ms-surface);
		font-size: 15px;
	}
	.footer a {
		color: var(--ms-text);
		text-decoration: none;
	}
	.footer a:hover {
		text-decoration: underline;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr));
		gap: 48px;
		padding-block: 64px 56px;
	}
	.about,
	.col {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.about {
		gap: 16px;
	}
	.about p {
		max-inline-size: 30em;
	}
	.col a[aria-current='true'] {
		font-weight: 650;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px 32px;
		padding-block: 32px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@media (max-width: 1023px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 32px;
		}
		.about {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 767px) {
		.footer a {
			display: inline-flex;
			align-items: center;
			min-block-size: 44px;
		}
		.col {
			gap: 0;
		}
		ul {
			flex-direction: column;
			gap: 0;
		}
	}
</style>
