<script lang="ts">
	// The ALTCHA widget's own stylesheet (the "external" build injects none).
	import 'altcha/altcha.css';
	import Banner from './Banner.svelte';
	import FieldError from './FieldError.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { MAX_LINKS, MAX_MESSAGE, MAX_NAME, MAX_EMAIL, type Problem } from '$lib/contact/validate';
	import { scripts } from '$lib/generated/client';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	// The form only works with JavaScript (ALTCHA), so it is hidden without it
	// (.js-only); src/client/pages/contact.ts does validation and sending.
	const locale = $derived(getLocale());
	const format = $derived(new Intl.NumberFormat(locale));

	// Texts the script needs, keyed by validation problem.
	const problems: Record<Problem | 'altcha', string> = $derived({
		name_long: m.contact_err_name_long({ max: MAX_NAME }),
		name_chars: m.contact_err_name_chars(),
		email_missing: m.contact_err_email_missing(),
		email_format: m.contact_err_email_format(),
		message_missing: m.contact_err_message_missing(),
		message_long: m.contact_err_message_long({ count: '{count}' }),
		message_chars: m.contact_err_message_chars(),
		message_links: m.contact_err_message_links({ max: MAX_LINKS }),
		privacy_missing: m.contact_err_privacy_missing(),
		altcha: m.contact_err_altcha()
	});
	// ALTCHA's i18n keys; the widget shows them, the script announces states.
	const altchaStrings = $derived(
		JSON.stringify({
			label: m.contact_altcha_label(),
			verifying: m.contact_altcha_verifying(),
			verified: m.contact_altcha_verified(),
			error: m.contact_altcha_error(),
			expired: m.contact_altcha_expired(),
			waitAlert: m.contact_altcha_wait(),
			footer: m.contact_altcha_footer()
		})
	);
</script>

<div class="js-only form-area">
	<Banner kind="summary" tone="deny" icon="warn" title={m.contact_summary_title()}>
		<ul class="summary-list" data-summary-list></ul>
	</Banner>
	<Banner kind="failed" tone="deny" icon="warn" title={m.contact_failed_title()} body={m.contact_failed_body()} mail />
	<Banner kind="limit" tone="ask" icon="clock" title={m.contact_limit_title()} body={m.contact_limit_body()} />
	<Banner kind="invalid" tone="deny" icon="warn" title={m.contact_invalid_title()} body={m.contact_invalid_body()} />

	<form class="form" action="/contact" method="post" novalidate data-contact-form data-worker={scripts.contactWorker}>
		<input type="hidden" name="lang" value={locale} />
		<div class="field">
			<label for="c-name">{m.contact_name()}<span class="hint">{m.contact_optional()}</span></label>
			<input id="c-name" name="name" type="text" autocomplete="name" maxlength={MAX_NAME} aria-describedby="c-name-err" />
			<FieldError id="c-name-err" />
		</div>
		<div class="field">
			<label for="c-email">{m.contact_email()}<span class="hint">{m.contact_required()}</span></label>
			<input
				id="c-email"
				name="email"
				type="email"
				autocomplete="email"
				inputmode="email"
				maxlength={MAX_EMAIL}
				required
				aria-describedby="c-email-err"
			/>
			<FieldError id="c-email-err" />
		</div>
		<div class="field">
			<label for="c-message">{m.contact_message()}<span class="hint">{m.contact_required()}</span></label>
			<textarea id="c-message" name="message" rows="8" required aria-describedby="c-message-err c-message-count"></textarea>
			<div class="below">
				<FieldError id="c-message-err" />
				<span id="c-message-count" class="count mono" data-level="ok"
					><span data-count>{format.format(0)}</span>{m.contact_count_suffix({ max: format.format(MAX_MESSAGE) })}</span
				>
			</div>
		</div>
		<div class="field">
			<div class="consent">
				<span class="box">
					<input id="c-privacy" name="privacy" value="yes" type="checkbox" required aria-describedby="c-privacy-err" />
					<Icon name="check" size={16} stroke={3} />
				</span>
				<label for="c-privacy"><RichText text={m.contact_privacy()} /> <span class="hint">{m.contact_required()}</span></label>
			</div>
			<FieldError id="c-privacy-err" indent />
		</div>
		<!-- Honeypot: off screen, out of the tab order and the accessibility tree. -->
		<div class="hp" aria-hidden="true">
			<label for="c-website">{m.contact_honeypot()}</label>
			<input id="c-website" name="website" type="text" tabindex="-1" autocomplete="off" />
		</div>
		<div class="field">
			<div
				class="altcha-slot"
				data-altcha-slot
				data-challenge="/contact/challenge"
				data-language={locale}
				data-strings={altchaStrings}
			></div>
			<FieldError id="c-altcha-err" />
		</div>
		<div class="actions">
			<button class="btn btn-primary submit" type="submit"
				><span class="spinner" aria-hidden="true"></span><span data-submit-label>{m.contact_send()}</span></button
			>
			<span class="muted req">{m.contact_req_hint()}</span>
		</div>
		<p class="visually-hidden" aria-live="polite" data-status></p>
		<template data-texts>
			{#each Object.entries(problems) as [key, text] (key)}<span data-text={key}>{text}</span>{/each}
			<span data-text="sending">{m.contact_sending()}</span>
		</template>
	</form>
</div>

<style>
	.form-area,
	.form {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.form-area {
		gap: 24px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	label {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 8px;
		font-weight: 600;
	}
	.hint {
		font-size: 14px;
		font-weight: 400;
		color: var(--ms-text-muted);
	}
	input[type='text'],
	input[type='email'],
	textarea {
		inline-size: 100%;
		min-block-size: 52px;
		padding: 0 14px;
		border: 1px solid var(--ms-border-strong);
		border-radius: var(--ms-radius);
		background: var(--ms-surface);
		color: var(--ms-text);
	}
	textarea {
		min-block-size: 200px;
		padding-block: 12px;
		line-height: 1.5;
		resize: vertical;
	}
	input:focus-visible,
	textarea:focus-visible {
		outline-offset: 1px;
	}
	input:global([aria-invalid='true']),
	textarea:global([aria-invalid='true']) {
		border: 1.5px solid var(--ms-deny-fg);
	}
	.below {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}
	.below > :global(.field-error) {
		flex: 1;
	}
	.count {
		flex: none;
		margin-inline-start: auto;
		font-size: 14px;
		color: var(--ms-text-muted);
	}
	.count:global([data-level='warn']) {
		color: var(--ms-ask-fg);
	}
	.count:global([data-level='over']) {
		color: var(--ms-deny-fg);
		font-weight: 600;
	}
	.consent {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		min-block-size: 44px;
	}
	.consent label {
		display: inline;
		font-weight: 400;
		cursor: pointer;
	}
	.consent label :global(a) {
		font-weight: 600;
	}
	.box {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 26px;
		block-size: 26px;
		margin-block-start: 1px;
	}
	.box input {
		appearance: none;
		position: absolute;
		inset: 0;
		margin: 0;
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 7px;
		background: var(--ms-surface);
		cursor: pointer;
	}
	.box input:checked {
		border-color: var(--ms-btn-bg);
		background: var(--ms-btn-bg);
	}
	.box input:global([aria-invalid='true']) {
		border-color: var(--ms-deny-fg);
	}
	.box :global(svg) {
		position: relative;
		color: var(--ms-btn-fg);
		pointer-events: none;
		visibility: hidden;
	}
	.box input:checked + :global(svg) {
		visibility: visible;
	}
	.hp {
		position: absolute;
		inset-inline-start: -10000px;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
	}
	.altcha-slot {
		min-block-size: 74px;
	}
	/* ALTCHA: only through its custom properties (README section 9, mapped to
	   the names of widget version 3; see the report). */
	.altcha-slot :global(altcha-widget) {
		--altcha-border-width: 1px;
		--altcha-border-radius: var(--ms-radius);
		--altcha-color-base: var(--ms-surface);
		--altcha-border-color: var(--ms-border-strong);
		--altcha-color-base-content: var(--ms-text);
		--altcha-checkbox-outline-color: var(--ms-focus);
		--altcha-color-error: var(--ms-deny-fg);
		--altcha-color-error-content: var(--ms-surface);
		--altcha-max-width: 320px;
		--altcha-checkbox-size: 24px;
		--altcha-checkbox-border-color: var(--ms-border-strong);
		--altcha-checkbox-border-width: 1.5px;
		--altcha-color-neutral: var(--ms-surface-2);
		--altcha-color-neutral-content: var(--ms-text-muted);
		--altcha-color-success: var(--ms-allow-fg);
		--altcha-color-success-content: var(--ms-surface);
		--altcha-color-primary: var(--ms-btn-bg);
		--altcha-color-primary-content: var(--ms-btn-fg);
		--altcha-spinner-color: var(--ms-text-muted);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
	}
	.submit {
		min-inline-size: 220px;
		font-weight: 650;
	}
	.req {
		font-size: 14.5px;
	}
	.spinner {
		display: none;
		inline-size: 18px;
		block-size: 18px;
		border: 2.5px solid currentColor;
		border-inline-end-color: transparent;
		border-radius: 50%;
		animation: contact-spin 0.8s linear infinite;
	}
	.form:global([aria-busy='true']) .spinner {
		display: inline-block;
	}
	.form:global([aria-busy='true']) .field,
	.form:global([aria-busy='true']) .actions {
		opacity: 0.75;
	}
	.form:global([aria-busy='true']) .submit:disabled {
		opacity: 1;
		cursor: progress;
	}
	.summary-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 4px 0 0;
		padding-inline-start: 18px;
		font-size: 16px;
	}
	.summary-list :global(a) {
		color: var(--ms-text);
	}
	@keyframes contact-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (max-width: 767px) {
		.submit {
			inline-size: 100%;
		}
	}
	@media (forced-colors: active) {
		.box input:checked {
			background: Highlight;
		}
		.box :global(svg) {
			color: HighlightText;
		}
	}
</style>
