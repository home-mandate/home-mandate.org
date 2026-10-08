import { SECURITY_URL } from '$lib/site';
import type { TextPage } from '../types';

export const security: TextPage = {
	title: 'security_title',
	intro: 'security_intro',
	blocks: [
		{ compare: [{ title: 'security_01_1', tone: 'allow', icon: 'shield', items: ['security_01_1_1', 'security_01_1_2', 'security_01_1_3', 'security_01_1_4'] }, { title: 'security_01_2', tone: 'deny', icon: 'warning', items: ['security_01_2_1', 'security_01_2_2', 'security_01_2_3', 'security_01_2_4'] }] },
		{ callout: 'security_02_title', icon: 'home', tone: 'info', text: ['security_02_text'] },
		{ callout: 'security_03_title', icon: 'bug', tone: 'warn', text: ['security_03_text'], link: { text: 'security_03_link', href: SECURITY_URL } }
	]
};
