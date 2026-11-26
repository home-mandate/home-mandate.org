<script lang="ts">
	import Icon from '../Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	// RELAY-v0 Section 1.1 as a drawing for everyone: the agent's TLS connection
	// runs through the relay and ends in the home; the gateway keeps the tunnel
	// open from inside. The relay sees the name, the address, the time and the
	// number of bytes, not the content.
</script>

<figure class="relay-diagram" aria-label={m.relay_diagram_figure()}>
	<div class="row">
		<div class="node agent">
			<Icon name="agent" size={22} />
			<strong>{m.relay_diagram_agent()}</strong>
			<span class="sub">{m.relay_diagram_agent_sub()}</span>
		</div>

		<div class="link" aria-hidden="true"><span class="line"></span></div>

		<div class="node relay">
			<Icon name="link" size={22} />
			<strong>{m.relay_diagram_relay()}</strong>
			<span class="sub">{m.relay_diagram_relay_sub()}</span>
		</div>

		<div class="link tunnel" aria-hidden="true"><span class="line"></span><span class="tag">{m.relay_diagram_tunnel()}</span></div>

		<div class="home">
			<span class="home-name"><Icon name="home" size={16} />{m.relay_diagram_home()}</span>
			<div class="node gateway">
				<Icon name="guard" size={22} />
				<strong>{m.relay_diagram_gateway()}</strong>
				<span class="sub">{m.relay_diagram_gateway_sub()}</span>
			</div>
		</div>
	</div>

	<div class="tls">
		<Icon name="lock" size={16} />
		<span>{m.relay_diagram_tls()}</span>
	</div>

	<ul class="facts">
		<li><span class="label">{m.relay_diagram_sees()}</span> {m.relay_diagram_sees_list()}</li>
		<li><span class="label">{m.relay_diagram_not()}</span> {m.relay_diagram_not_list()}</li>
	</ul>
</figure>

<style>
	.relay-diagram {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin: 0;
		padding: 28px 24px 22px;
		border: 1px solid var(--ms-border);
		border-radius: 16px;
		background: var(--ms-bg);
		container-type: inline-size;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr) 80px minmax(0, 1.15fr);
		align-items: center;
	}
	.node {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		padding: 14px 16px;
		border: 1px solid var(--ms-border-strong);
		border-radius: 12px;
		background: var(--ms-surface);
	}
	.node :global(svg) {
		color: var(--ms-accent);
	}
	.node strong {
		font-size: 16px;
	}
	.sub {
		font-size: 13.5px;
		line-height: 1.35;
		color: var(--ms-text-muted);
	}
	.relay {
		border-style: dashed;
	}
	.home {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 10px;
		border: 1px solid var(--ms-allow-border);
		border-radius: 14px;
		background: var(--ms-allow-bg);
	}
	.home-name {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12.5px;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ms-allow-fg);
	}
	.link {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.line {
		align-self: stretch;
		block-size: 2px;
		background: var(--ms-border-strong);
	}
	.tunnel .line {
		block-size: 10px;
		border-block: 2px solid var(--ms-border-strong);
		background: none;
	}
	.tag {
		font-size: 12px;
		color: var(--ms-text-muted);
	}

	/* The TLS of the agent: one bar from the agent into the home, across the relay. */
	.tls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid var(--ms-allow-border);
		border-radius: 999px;
		background: var(--ms-allow-bg);
		color: var(--ms-allow-fg);
		font-size: 14px;
		font-weight: 600;
		text-align: center;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 14.5px;
	}
	.facts li {
		padding: 10px 14px;
		border-radius: 10px;
		background: var(--ms-surface-2);
	}
	.label {
		font-weight: 650;
	}

	@container (max-width: 640px) {
		.row {
			grid-template-columns: minmax(0, 1fr);
		}
		.link {
			flex-direction: row;
			block-size: 36px;
			padding-inline-start: 28px;
		}
		.line {
			align-self: stretch;
			inline-size: 2px;
			block-size: auto;
		}
		.tunnel .line {
			inline-size: 10px;
			border-block: 0;
			border-inline: 2px solid var(--ms-border-strong);
		}
		.facts {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (forced-colors: active) {
		.home,
		.tls,
		.facts li {
			border: 1px solid CanvasText;
		}
	}
</style>
