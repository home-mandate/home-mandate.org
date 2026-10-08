import type { TextPage } from '../types';

export const why: TextPage = {
	title: 'why_title',
	intro: 'why_intro',
	blocks: [
		{ h2: 'why_01', id: 'agents-are-moving-in' },
		{ p: 'why_02' },
		{ h2: 'why_03', id: 'a-master-key-or-a-power-of-attorney' },
		{ compare: [{ title: 'why_04_1', tone: 'deny', icon: 'key', items: ['why_04_1_1', 'why_04_1_2', 'why_04_1_3'] }, { title: 'why_04_2', tone: 'allow', icon: 'doc', items: ['why_04_2_1', 'why_04_2_2', 'why_04_2_3'] }] },
		{ h2: 'why_05', id: 'a-short-story-the-forged-e-mail' },
		{ story: [{ icon: 'mail', tone: 'deny', title: 'why_06_1_title', body: 'why_06_1_body' }, { icon: 'agent', tone: 'ask', title: 'why_06_2_title', body: 'why_06_2_body' }, { icon: 'guard', tone: 'allow', title: 'why_06_3_title', body: 'why_06_3_body' }] },
		{ tech: 'why_07_title', text: ['why_07_text'] },
		{ tech: 'why_08_title', text: ['why_08_text'] },
		{ callout: 'why_everyday_title', icon: 'home', tone: 'tip', text: ['why_everyday_text'], link: { text: 'why_everyday_link', href: '/everyday/' } }
	]
};
