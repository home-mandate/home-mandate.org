<script lang="ts">
	import RichText from '../RichText.svelte';
	import CommandLine from './CommandLine.svelte';

	// Installing and running a test tool, on /implement/ and /implement/relay/:
	// text on one side, the commands (each copyable) on the other. Each command's
	// element is <prefix>-<command id> (e.g. #cmd-install, which tests rely on).
	let {
		id,
		title,
		body,
		more,
		commands,
		prefix = 'cmd'
	}: { id: string; title: string; body: string; more: string; commands: { id: string; label: string; command: string }[]; prefix?: string } = $props();
</script>

<div class="wrap">
	<section class="install" aria-labelledby={id}>
		<div class="text">
			<h2 {id}>{title}</h2>
			<p class="muted">{body}</p>
			<p class="muted"><RichText text={more} /></p>
		</div>
		<div class="commands">
			{#each commands as c (c.id)}
				<CommandLine id="{prefix}-{c.id}" label={c.label} command={c.command} />
			{/each}
		</div>
	</section>
</div>

<style>
	.install {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
		gap: 48px;
		align-items: start;
		padding-block: clamp(32px, 3.9vw, 56px);
	}
	h2 {
		font-size: clamp(22px, 1.2rem + 0.4vw, 26px);
		line-height: 1.25;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.commands {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-inline-size: 0;
	}
	@media (max-width: 1023px) {
		.install {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
		}
	}
</style>
