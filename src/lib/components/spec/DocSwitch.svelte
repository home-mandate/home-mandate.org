<script lang="ts">
	import { pathIn } from '#lib/locale.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	// Which document a page shows: the core specification or the Relay
	// Specification that builds on it. Used by the reader and the changelog.
	// variant: wide (desktop bar only), phone (narrow screens only), inline (always).
	let {
		current,
		paths,
		variant = 'wide'
	}: { current: 'spec' | 'relay'; paths: { spec: string; relay: string }; variant?: 'wide' | 'phone' | 'inline' } = $props();

	const locale = $derived(getLocale());
	const items = $derived([
		{ id: 'spec', href: pathIn(paths.spec, locale), label: m.spec_doc_core() },
		{ id: 'relay', href: pathIn(paths.relay, locale), label: m.spec_doc_relay() }
	]);
</script>

<nav class="docs {variant} no-print" aria-label={m.spec_docs_label()}>
	{#each items as s (s.id)}<a href={s.href} aria-current={s.id === current ? 'page' : undefined}>{s.label}</a>{/each}
</nav>

<style>
	.docs {
		display: inline-flex;
		flex: none;
		align-self: flex-start;
		padding: 3px;
		border: 1px solid var(--ms-border);
		border-radius: 10px;
		background: var(--ms-surface-2);
	}
	a {
		display: inline-flex;
		align-items: center;
		min-block-size: 34px;
		padding-inline: 12px;
		border-radius: 7px;
		color: var(--ms-text-muted);
		font-size: 14.5px;
		font-weight: 600;
		text-decoration: none;
	}
	a:hover {
		color: var(--ms-text);
	}
	a[aria-current='page'] {
		background: var(--ms-surface);
		color: var(--ms-text);
		box-shadow: var(--ms-shadow-1);
	}
	.phone {
		display: none;
	}
	@media (max-width: 1023px) {
		.wide {
			display: none;
		}
		.phone {
			display: inline-flex;
		}
		.phone a,
		.inline a {
			min-block-size: 40px;
		}
	}
	@media (forced-colors: active) {
		a[aria-current='page'] {
			border: 1px solid CanvasText;
		}
	}
</style>
