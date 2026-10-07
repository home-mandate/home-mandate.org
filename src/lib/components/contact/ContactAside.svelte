<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import MailLink from './MailLink.svelte';
	import { m } from '$lib/paraglide/messages';
	import { SECURITY_URL, SPEC_REPOSITORY } from '$lib/site';

	// The e-mail address as an equal alternative to the form, topics and
	// the places that fit some requests better.
	const topics = [m.contact_topic_1(), m.contact_topic_2(), m.contact_topic_3()];
</script>

<aside class="aside" aria-labelledby="contact-mail-title">
	<div class="group">
		<span class="mail-icon"><Icon name="mail" size={22} /></span>
		<h2 id="contact-mail-title" class="title">{m.contact_mail_title()}</h2>
		<p class="muted body">{m.contact_mail_body()}</p>
		<MailLink />
	</div>
	<div class="group rule">
		<h3 class="topics-title">{m.contact_topics_title()}</h3>
		<ul class="topics">
			{#each topics as topic (topic)}<li>{topic}</li>{/each}
		</ul>
	</div>
	<div class="group rule elsewhere">
		<h3 class="else-title">{m.contact_else_title()}</h3>
		<a href={SECURITY_URL}>{m.contact_else_security()}<Icon name="external" size={14} /><span class="visually-hidden"
				>{m.common_external()}</span
			></a>
		<a href="{SPEC_REPOSITORY}/issues">{m.contact_else_github()}<Icon name="external" size={14} /><span
				class="visually-hidden">{m.common_external()}</span
			></a>
	</div>
</aside>

<style>
	.aside {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 24px;
		border: 1px solid var(--ms-border);
		border-radius: var(--ms-radius-lg);
		background: var(--ms-surface);
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.rule {
		gap: 10px;
		padding-block-start: 18px;
		border-block-start: 1px solid var(--ms-border);
	}
	.mail-icon {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		border-radius: 11px;
		background: var(--ms-surface-2);
	}
	.title {
		font-size: 19px;
		line-height: 1.3;
		font-weight: 650;
		letter-spacing: 0;
	}
	.body {
		font-size: 15.5px;
	}
	.topics-title {
		font-size: 15px;
		font-weight: 650;
	}
	.topics {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 15.5px;
	}
	.topics li {
		display: flex;
		gap: 10px;
	}
	.topics li::before {
		content: '';
		flex: none;
		inline-size: 6px;
		block-size: 6px;
		margin-block-start: 10px;
		border-radius: 50%;
		background: var(--ms-border-strong);
	}
	.elsewhere {
		gap: 6px;
		font-size: 15px;
	}
	.else-title {
		font-size: 15px;
		font-weight: 400;
		color: var(--ms-text-muted);
	}
	.elsewhere a {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		gap: 6px;
		min-block-size: 24px;
		font-weight: 600;
	}
	@media (forced-colors: active) {
		.topics li::before {
			background: CanvasText;
		}
	}
</style>
