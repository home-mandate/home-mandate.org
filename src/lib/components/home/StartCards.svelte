<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	const locale = getLocale();
	const entries = [
		{ path: '/why/', who: m.home_start_why_who(), title: m.home_start_why_title(), body: m.home_start_why_body(), link: m.home_start_why_link() },
		{ path: '/playground/', who: m.home_start_play_who(), title: m.home_start_play_title(), body: m.home_start_play_body(), link: m.home_start_play_link() },
		{ path: '/spec/v0/', who: m.home_start_spec_who(), title: m.home_start_spec_title(), body: m.home_start_spec_body(), link: m.home_start_spec_link() }
	];
</script>

<section class="section" aria-labelledby="start-title">
	<div class="wrap">
		<h2 id="start-title">{m.home_start_title()}</h2>
		<ul class="cards">
			{#each entries as entry (entry.path)}
				<li>
					<a class="card" href={pathIn(entry.path, locale)}>
						<span class="who mono">{entry.who}</span>
						<h3>{entry.title}</h3>
						<span class="body">{entry.body}</span>
						<span class="link">{entry.link}<Icon name="arrow" size={18} stroke={2} /></span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	h2 {
		margin-block-end: 40px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
	}
	.card {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 14px;
		padding: 32px;
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		background: var(--ms-surface);
		color: var(--ms-text);
		text-decoration: none;
		transition:
			border-color var(--ms-dur) var(--ms-ease),
			box-shadow var(--ms-dur) var(--ms-ease);
	}
	.card:hover {
		border-color: var(--ms-border-strong);
		box-shadow: var(--ms-shadow-1);
	}
	.who {
		font-size: 13px;
		color: var(--ms-text-muted);
	}
	h3 {
		font-size: 26px;
		font-weight: 650;
		letter-spacing: -0.01em;
	}
	.body {
		color: var(--ms-text-muted);
		text-wrap: pretty;
	}
	.link {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-block-start: auto;
		padding-block-start: 8px;
		color: var(--ms-accent);
		font-weight: 600;
	}
	.card:hover .link {
		text-decoration: underline;
	}

	@media (max-width: 1023.98px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767.98px) {
		h2 {
			margin-block-end: 20px;
		}
		.cards {
			grid-template-columns: minmax(0, 1fr);
			gap: 12px;
		}
		.card {
			gap: 8px;
			padding: 20px;
			border-radius: 14px;
		}
		.who {
			font-size: 12.5px;
		}
		h3 {
			font-size: 21px;
		}
		.body {
			font-size: 16px;
		}
		.link {
			min-block-size: 32px;
			padding-block-start: 0;
		}
	}
	@media (forced-colors: active) {
		.card {
			border-color: LinkText;
		}
	}
</style>
