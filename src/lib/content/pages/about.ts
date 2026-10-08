import { SPEC_REPOSITORY, TRANSLATING_URL } from '$lib/site';
import type { TextPage } from '../types';

export const about: TextPage = {
	title: 'about_title',
	intro: 'about_intro',
	blocks: [
		{ h2: 'about_01', id: 'principles' },
		{ list: [{ title: 'about_02_1_title', body: 'about_02_1_body' }, { title: 'about_02_2_title', body: 'about_02_2_body' }, { title: 'about_02_3_title', body: 'about_02_3_body' }, { title: 'about_02_4_title', body: 'about_02_4_body' }] },
		{ h2: 'about_03', id: 'how-changes-happen' },
		{ process: [{ icon: 'issue', title: 'about_04_1_title', body: 'about_04_1_body' }, { icon: 'spec', title: 'about_04_2_title', body: 'about_04_2_body' }, { icon: 'test', title: 'about_04_3_title', body: 'about_04_3_body' }, { icon: 'code', title: 'about_04_4_title', body: 'about_04_4_body' }] },
		{ h2: 'about_05', id: 'get-involved' },
		{ cards: [{ icon: 'github', title: 'about_06_1_title', body: 'about_06_1_body', link: 'about_06_1_link', href: SPEC_REPOSITORY }, { icon: 'globe', title: 'about_06_2_title', body: 'about_06_2_body', link: 'about_06_2_link', href: TRANSLATING_URL }, { icon: 'code', title: 'about_06_3_title', body: 'about_06_3_body', link: 'about_06_3_link', href: '/implement/' }] }
	]
};
