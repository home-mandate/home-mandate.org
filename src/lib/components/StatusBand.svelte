<script lang="ts">
	import { relay } from '#lib/generated/relay.ts';
	import { spec } from '#lib/generated/spec.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { statusVersion } from '#lib/spec/version.ts';

	const version = statusVersion(spec.versions.map((v) => v.tag));
	const relayVersion = statusVersion(relay.versions.map((v) => v.tag));
</script>

<p class="band"><span class="dot" aria-hidden="true"></span>{m.common_status({ version, relay: relayVersion })}</p>

<style>
	.band {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		min-block-size: 32px;
		padding: 4px 16px;
		background: var(--ms-band-bg);
		color: var(--ms-band-fg);
		font-size: 13px;
		letter-spacing: 0.02em;
		text-align: center;
	}
	.dot {
		inline-size: 6px;
		block-size: 6px;
		flex: none;
		border-radius: 50%;
		background: var(--ms-ask-fg);
	}
	@media print {
		.band {
			display: none;
		}
	}
</style>
