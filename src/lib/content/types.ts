// Structure of a text page. Text is never written here: every K is the key of
// a message in languages/<tag>/pages/<page>.json, so translators only touch
// texts and the structure stays the same in every language.
import type { IconName } from '$lib/icons';
import type { m } from '$lib/paraglide/messages';

export type K = keyof typeof m;
export type Tone = 'allow' | 'ask' | 'deny';

export type Block =
	| { h2: K; id: string }
	| { h3: K; id?: string }
	| { p: K }
	| { ul: K[] }
	| { toc: K }
	| { compare: { title: K; tone: Tone; icon: IconName; items: K[] }[] }
	| { story: { icon: IconName; tone: Tone; title: K; body: K }[] }
	| { tech: K; text: K[] }
	| { callout: K; icon?: IconName; tone?: 'info' | 'tip' | 'warn' | 'critical'; text: K[]; link?: { text: K; href: string } }
	| { faq: { id: string; q: K; a: K }[] }
	| { glossary: { term: K; code: string; def: K }[] }
	| { list: { title: K; body: K }[] }
	| { process: { icon: IconName; title: K; body: K }[] }
	| { cards: { icon: IconName; title: K; body: K; link: K; href: string }[] }
	| { code: string; file?: string };

export interface TextPage {
	title: K;
	intro: K;
	eyebrow?: string;
	icon?: IconName;
	blocks: Block[];
}
