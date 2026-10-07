<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import ContactAside from '$lib/components/contact/ContactAside.svelte';
	import ContactForm from '$lib/components/contact/ContactForm.svelte';
	import MailLink from '$lib/components/contact/MailLink.svelte';
	import { scripts } from '$lib/generated/client';
	import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.contact_title()} – {m.site_name()}</title>
	<meta name="description" content={m.contact_intro()} />
	<script type="module" src={scripts.contact}></script>
</svelte:head>

<div class="wrap page">
	<div class="main-col">
		<header class="head">
			<h1>{m.contact_title()}</h1>
			<p class="lead">{m.contact_intro()}</p>
		</header>

		<div class="no-js-only nojs">
			<Icon name="mail" size={28} />
			<div class="nojs-text">
				<h2 class="nojs-title">{m.contact_nojs_title()}</h2>
				<p>{m.contact_nojs_body()}</p>
				<MailLink size="large" />
			</div>
		</div>

		<ContactForm />
	</div>

	<ContactAside />
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
		gap: 72px;
		align-items: start;
		padding-block: clamp(32px, 4.5vw, 64px) clamp(56px, 6.7vw, 96px);
	}
	.main-col {
		display: flex;
		flex-direction: column;
		gap: 24px;
		min-inline-size: 0;
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.nojs {
		display: flex;
		gap: 16px;
		padding: 24px;
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.nojs > :global(svg) {
		color: var(--ms-accent);
	}
	.nojs-text {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}
	.nojs-title {
		font-size: 20px;
		line-height: 1.3;
		font-weight: 650;
		letter-spacing: 0;
	}
	@media (max-width: 1023px) {
		.page {
			gap: 40px;
		}
	}
	@media (max-width: 767px) {
		.page {
			grid-template-columns: minmax(0, 1fr);
			gap: 32px;
		}
	}
</style>
