import { m } from '$lib/paraglide/messages';
import type { K } from './types';

/** Text of a message key without parameters (page texts never have any). */
export function t(key: K): string {
	return (m[key] as () => string)();
}
