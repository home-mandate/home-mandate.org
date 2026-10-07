// Canonical JSON (RFC 8785, JCS) and the "sha256:<hex>" digest that the
// specification uses for mandates (SPEC-v0 section 3.2) and audit log entries
// (section 9.4). Mandates and log entries contain only strings, integers,
// booleans, null, arrays and objects, so integers need no float formatting.

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** JCS: object keys sorted by UTF-16 code units, no whitespace, ES string escaping. */
export function canonical(value: Json): string {
	if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
	if (value !== null && typeof value === 'object') {
		const keys = Object.keys(value).sort();
		return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k] as Json)}`).join(',')}}`;
	}
	if (typeof value === 'number' && !Number.isSafeInteger(value)) {
		throw new Error(`canonical: only safe integers are supported, got ${value}`);
	}
	return JSON.stringify(value);
}

/** "sha256:" + hex(SHA-256(JCS(value))), via Web Crypto (browser and Node). */
export async function digest(value: Json): Promise<string> {
	const bytes = new TextEncoder().encode(canonical(value));
	const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
	return `sha256:${[...hash].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/** Short form for display: first and last four hex digits. */
export function shortDigest(value: string | null): string {
	if (value === null) return 'null';
	const hex = value.replace(/^sha256:/, '');
	return `${hex.slice(0, 4)}…${hex.slice(-4)}`;
}
