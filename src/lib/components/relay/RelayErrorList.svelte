<script lang="ts">
	import SpecInline from '../spec/SpecInline.svelte';
	import { pathIn } from '#lib/locale.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { RelayErrorView } from '#lib/relay/errors.ts';

	// The problem types of the Relay Specification (RELAY-v0 Section 5.1), one
	// card each. The cells are the specification's English text; current marks
	// the error whose own page this is.
	let { errors, current }: { errors: RelayErrorView[]; current?: string } = $props();

	const locale = $derived(getLocale());
</script>

<ul class="errors">
	{#each errors as e (e.name)}
		<li class:current={e.name === current} id={e.name}>
			<div class="top">
				<a class="name mono" href={pathIn(`/relay/errors/${e.name}/`, locale)} aria-current={e.name === current ? 'page' : undefined}>{e.name}</a>
				<span class="status mono">HTTP {e.status}</span>
			</div>
			<dl>
				<dt>{m.relay_errors_meaning()}</dt>
				<dd lang="en"><SpecInline nodes={e.meaning} /></dd>
				<dt>{m.relay_errors_gateway()}</dt>
				<dd lang="en"><SpecInline nodes={e.gateway} /></dd>
			</dl>
		</li>
	{/each}
</ul>

<style>
	.errors {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 18px 20px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
		scroll-margin-block-start: 24px;
	}
	li.current {
		border-color: var(--ms-accent);
		box-shadow: var(--ms-shadow-1);
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}
	.name {
		font-size: 17px;
		font-weight: 650;
	}
	.status {
		padding: 2px 8px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		font-size: 12.5px;
		color: var(--ms-text-muted);
	}
	dl {
		display: grid;
		gap: 4px;
		margin: 0;
		font-size: 15px;
	}
	dt {
		font-size: 12.5px;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ms-text-muted);
	}
	dd {
		margin: 0 0 8px;
	}
	dd :global(code) {
		font-size: 0.88em;
	}
</style>
