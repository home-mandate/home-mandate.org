<script lang="ts">
	import Icon from '../Icon.svelte';
	import { kilobytes, shortHash, type Download } from '$lib/implement/downloads';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	// A file of the specification: what it is, size, SHA-256 (short, expandable
	// with <details>, copyable with JavaScript) and the download link.
	let { download, title, body, version }: { download: Download; title: string; body: string; version: string } = $props();

	const locale = $derived(getLocale());
	const id = $derived(`dl-${download.id}`);
</script>

<article class="card" aria-labelledby="{id}-title">
	<div class="head">
		<Icon name="spec" size={22} />
		<h3 id="{id}-title">{title}</h3>
		<span class="version mono"><span class="visually-hidden">{m.implement_dl_version()} </span>{version}</span>
	</div>
	<p class="body">{body}</p>
	<p class="meta mono">{download.file} · {m.implement_dl_size({ size: kilobytes(download.bytes, locale) })}</p>
	<div class="hash">
		<details>
			<summary>
				<span class="algo">SHA-256</span>
				<span class="short mono">{shortHash(download.sha256)}</span>
				<span class="toggle"><span class="show">{m.implement_dl_show()}</span><span class="hide">{m.implement_dl_hide()}</span></span>
			</summary>
			<code class="full">{download.sha256}</code>
		</details>
		<div class="tools js-only">
			<button type="button" class="copy" data-copy={download.sha256} aria-label="{m.implement_dl_copy_hash()}: {title}">
				<span class="idle"><Icon name="copy" size={14} stroke={2} /></span>
				<span class="done"><Icon name="check" size={14} stroke={2.4} /></span>
			</button>
			<span class="visually-hidden" aria-live="polite" data-copy-status={m.common_copied()}></span>
		</div>
	</div>
	<a class="btn btn-primary btn-sm get" href={download.href} download={download.file}>
		<Icon name="download" size={18} stroke={1.9} />{m.implement_dl_download()}<span class="visually-hidden">: {title}</span>
	</a>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 22px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
		min-inline-size: 0;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	h3 {
		flex: 1;
		font-size: 17px;
		font-weight: 650;
	}
	.version {
		padding: 2px 8px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		font-size: 12px;
		white-space: nowrap;
	}
	.body {
		font-size: 14.5px;
		color: var(--ms-text-muted);
	}
	.meta {
		font-size: 13px;
		color: var(--ms-text-muted);
		overflow-wrap: anywhere;
	}
	.hash {
		position: relative;
		border-radius: 8px;
		background: var(--ms-surface-2);
		font-family: var(--ms-font-mono);
		font-size: 12.5px;
	}
	summary {
		display: flex;
		align-items: center;
		gap: 6px;
		min-block-size: 46px;
		padding-block: 8px;
		padding-inline: 10px 48px;
		border-radius: 8px;
		list-style: none;
		cursor: pointer;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.algo {
		color: var(--ms-text-muted);
	}
	.algo,
	.short {
		white-space: nowrap;
	}
	.short {
		flex: 1;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		block-size: 30px;
		padding-inline: 8px;
		border: 1px solid var(--ms-border);
		border-radius: 6px;
		background: var(--ms-surface);
		font-family: var(--ms-font-sans);
		font-weight: 500;
	}
	summary:hover .toggle {
		border-color: var(--ms-border-strong);
	}
	.hide,
	details[open] .show {
		display: none;
	}
	details[open] .hide {
		display: inline;
	}
	.full {
		display: block;
		padding: 0 10px 10px;
		background: none;
		font-size: 12.5px;
		line-height: 1.5;
		word-break: break-all;
	}
	.tools {
		position: absolute;
		inset-block-start: 8px;
		inset-inline-end: 10px;
	}
	.copy {
		display: grid;
		place-items: center;
		inline-size: 30px;
		block-size: 30px;
		padding: 0;
		border: 1px solid var(--ms-border-strong);
		border-radius: 6px;
		background: var(--ms-surface);
		cursor: pointer;
	}
	.copy span {
		display: grid;
		place-items: center;
	}
	.copy .done,
	:global(.hash .copy[data-copied]) .idle {
		display: none;
	}
	:global(.hash .copy[data-copied]) .done {
		display: grid;
	}
	:global(.hash .copy[data-copied]) {
		border-color: var(--ms-allow-border);
		background: var(--ms-allow-bg);
		color: var(--ms-allow-fg);
	}
	.get {
		margin-block-start: auto;
	}
	@media (max-width: 767px) {
		.card {
			gap: 10px;
			padding: 16px;
			border-radius: 12px;
		}
		.head :global(svg) {
			display: none;
		}
		h3 {
			font-size: 16px;
		}
		/* Too narrow for label, hash, toggle and copy button: keep the label for screen readers. */
		.algo {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
		summary {
			min-block-size: 60px;
			padding-inline-end: 62px;
		}
		.toggle {
			block-size: 36px;
			padding-inline: 10px;
			font-size: 13px;
		}
		.tools {
			inset-block-start: 8px;
		}
		.copy {
			inline-size: 44px;
			block-size: 44px;
		}
		.get {
			min-block-size: 48px;
		}
	}
	@media (forced-colors: active) {
		.toggle,
		.copy,
		.version {
			border-color: ButtonText;
		}
	}
</style>
