<script lang="ts">
	import Icon from '../Icon.svelte';
	import RichText from '../RichText.svelte';
	import RelayDiagram from '../diagrams/RelayDiagram.svelte';
	import { pathIn } from '#lib/locale.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	// Reaching the home from outside through a relay (Relay Specification),
	// in plain words: the drawing, the two protection levels and where to read on.
	const locale = $derived(getLocale());
</script>

<section class="wrap remote" aria-labelledby="how-remote" id="remote">
	<div class="intro">
		<h2 id="how-remote">{m.how_remote_title()}</h2>
		<p class="sub">{m.how_remote_sub()}</p>
	</div>

	<RelayDiagram />

	<div class="levels">
		<article class="level">
			<div class="level-top"><Icon name="search" size={22} /><h3>{m.how_remote_standard_title()}</h3></div>
			<p class="mono name">&lt;id&gt;.&lt;name-domain&gt;</p>
			<p>{m.how_remote_standard_body()}</p>
		</article>
		<article class="level strong">
			<div class="level-top"><Icon name="key" size={22} /><h3>{m.how_remote_own_title()}</h3></div>
			<p class="mono name">mcp.your-home.example</p>
			<p>{m.how_remote_own_body()}</p>
		</article>
	</div>

	<p class="note muted"><RichText text={m.how_remote_note()} /></p>
	<div class="links">
		<a class="text-link" href={pathIn('/relay/v0/', locale)}>{m.how_remote_spec_link()} <span aria-hidden="true">→</span></a>
		<a class="text-link" href={pathIn('/implement/relay/', locale)}>{m.how_remote_impl_link()} <span aria-hidden="true">→</span></a>
	</div>
</section>

<style>
	.remote {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-block: clamp(40px, 5vw, 72px) clamp(16px, 2vw, 24px);
	}
	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-inline-size: 46em;
	}
	.sub {
		font-size: 18px;
		color: var(--ms-text-muted);
		text-wrap: pretty;
	}
	.levels {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}
	.level {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px 22px;
		border: 1px solid var(--ms-border);
		border-radius: 14px;
		background: var(--ms-surface);
	}
	.level.strong {
		border-color: var(--ms-allow-border);
	}
	.level-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.level-top :global(svg) {
		color: var(--ms-accent);
	}
	.level h3 {
		font-size: 19px;
		font-weight: 650;
	}
	.name {
		font-size: 13.5px;
		color: var(--ms-text-muted);
	}
	.level p:not(.name) {
		font-size: 15.5px;
	}
	.note {
		max-inline-size: 52em;
		font-size: 15px;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 24px;
	}
	.links a {
		min-block-size: 44px;
		display: inline-flex;
		align-items: center;
	}
	@media (max-width: 767px) {
		.levels {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
