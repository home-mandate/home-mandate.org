// Texts of the playground for the browser script: every playground_* message of the
// current language, with its placeholders kept as {name} (the script fills them).
import { m } from '$lib/paraglide/messages';
import type { Texts } from '$lib/playground/texts';

const PREFIX = 'playground_';

// Each placeholder is "filled" with its own name in braces.
const KEEP = new Proxy({}, { get: (_target, name) => (typeof name === 'string' ? `{${name}}` : undefined) });

export function playgroundTexts(): Texts {
	const out: Record<string, string> = {};
	for (const [key, message] of Object.entries(m)) {
		if (!key.startsWith(PREFIX) || typeof message !== 'function') continue;
		out[key.slice(PREFIX.length)] = String((message as (inputs: unknown) => string)(KEEP));
	}
	return out;
}
