<script lang="ts">
	// Number in a circle for ordered steps (the list itself is an <ol>, so the
	// number is presentation only).
	let { n, size = 32 }: { n: number; size?: 30 | 32 | 36 } = $props();
</script>

<span class="step s{size}" aria-hidden="true">{n}</span>

<style>
	.step {
		display: grid;
		place-items: center;
		flex: none;
		border: 1.5px solid var(--ms-border-strong);
		border-radius: 50%;
		font-weight: 650;
	}
	.s30 {
		inline-size: 30px;
		block-size: 30px;
		font-size: 14px;
	}
	.s32 {
		inline-size: 32px;
		block-size: 32px;
		font-size: 15px;
	}
	.s36 {
		inline-size: 36px;
		block-size: 36px;
		font-size: 16px;
	}
</style>
