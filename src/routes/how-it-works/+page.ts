import example from '#lib/content/example-mandate.json';
import { buildChain } from '#lib/how/chain.ts';
import type { Mandate } from '#lib/how/mandate-check.ts';

// Prerendered only (csr = false): the hash chain is computed once at build
// time with real SHA-256, both intact and with entry 2 edited.
export async function load() {
	return { chain: await buildChain(example as Mandate) };
}
