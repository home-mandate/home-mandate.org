<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import MailLink from './MailLink.svelte';
	import { pathIn } from '$lib/locale';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import type { IconName } from '$lib/icons';

	// Landing pages of the contact service's 303 (/contact/{sent,failed,limit,invalid}/).
	// Static pages: reloading one sends nothing. Not for search engines.
	let {
		tone,
		icon,
		title,
		body,
		mail = false,
		primary
	}: { tone: 'allow' | 'ask' | 'deny'; icon: IconName; title: string; body: string; mail?: boolean; primary: 'home' | 'form' } =
		$props();

	const locale = $derived(getLocale());
</script>

<svelte:head>
	<title>{title} – {m.site_name()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="wrap">
	<div class="result">
		<span class="mark {tone}"><Icon name={icon} size={34} stroke={2.4} /></span>
		<h1>{title}</h1>
		<p class="lead">{body}</p>
		{#if mail}<MailLink size="large" />{/if}
		<div class="actions">
			{#if primary === 'home'}
				<a class="btn btn-primary" href={pathIn('/', locale)}>{m.contact_to_home()}</a>
				<a class="btn btn-secondary" href={pathIn('/contact/', locale)}>{m.contact_another()}</a>
			{:else}
				<a class="btn btn-primary" href={pathIn('/contact/', locale)}>{m.contact_back()}</a>
				<a class="btn btn-secondary" href={pathIn('/', locale)}>{m.contact_to_home()}</a>
			{/if}
		</div>
	</div>
</div>

<style>
	.result {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		max-inline-size: 640px;
		min-block-size: 520px;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
	}
	h1 {
		line-height: 1.12;
	}
	.mark {
		display: grid;
		place-items: center;
		inline-size: 72px;
		block-size: 72px;
		border: 1.5px solid;
		border-radius: 50%;
	}
	.allow {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
		color: var(--ms-allow-fg);
	}
	.ask {
		border-color: var(--ms-ask-border);
		background: var(--ms-ask-bg);
		color: var(--ms-ask-fg);
	}
	.deny {
		border-color: var(--ms-deny-border);
		background: var(--ms-deny-bg);
		color: var(--ms-deny-fg);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-block-start: 8px;
	}
	@media (max-width: 767px) {
		.result {
			min-block-size: 0;
		}
		.actions .btn {
			inline-size: 100%;
		}
	}
	@media (forced-colors: active) {
		.mark {
			border-color: CanvasText;
		}
	}
</style>
