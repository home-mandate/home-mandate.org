<script lang="ts">
	let { size = 30, wordmark = true }: { size?: number; wordmark?: boolean } = $props();
</script>

<!-- House with the three decision dots; colours from the brand and decision tokens. -->
<span class="logo">
	<svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
		<path class="house" d="M4 15L16 5l12 10M7 12.5V27h18V12.5" stroke-width="2.6" />
		<circle class="allow" cx="11.5" cy="20.5" r="2.2" />
		<circle class="ask" cx="16" cy="20.5" r="2.2" />
		<circle class="deny" cx="20.5" cy="20.5" r="2.2" />
	</svg>
	{#if wordmark}<span class="word" dir="ltr">Home-Mandate</span>{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		white-space: nowrap;
	}
	.house {
		stroke: var(--ms-brand-1);
	}
	.allow {
		fill: var(--ms-allow-fg);
	}
	.ask {
		fill: var(--ms-ask-fg);
	}
	.deny {
		fill: var(--ms-deny-fg);
	}
	.word {
		font-size: 20px;
		font-weight: 650;
		letter-spacing: -0.01em;
	}
	@media (max-width: 767px) {
		.word {
			font-size: 18px;
		}
	}
	/* "Home-Mandate" is wider than the old wordmark; keep the header within 375 px. */
	@media (max-width: 400px) {
		.logo {
			gap: 8px;
		}
		.word {
			font-size: 16px;
		}
	}
	@media (forced-colors: active) {
		.house {
			stroke: CanvasText;
		}
		circle {
			fill: CanvasText;
		}
	}
</style>
