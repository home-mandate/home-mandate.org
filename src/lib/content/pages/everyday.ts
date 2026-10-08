import type { TextPage } from '../types';

export const everyday: TextPage = {
	title: 'everyday_title',
	intro: 'everyday_intro',
	blocks: [
		{ h2: 'everyday_app_title', id: 'is-my-smart-home-app-not-enough' },
		{ p: 'everyday_app_lead' },
		{
			versus: {
				head: ['everyday_vs_head_app', 'everyday_vs_head_mandate'],
				rows: [
					{ label: 'everyday_vs_who', without: 'everyday_vs_who_app', with: 'everyday_vs_who_mandate' },
					{ label: 'everyday_vs_what', without: 'everyday_vs_what_app', with: 'everyday_vs_what_mandate' },
					{ label: 'everyday_vs_limit', without: 'everyday_vs_limit_app', with: 'everyday_vs_limit_mandate' },
					{ label: 'everyday_vs_when', without: 'everyday_vs_when_app', with: 'everyday_vs_when_mandate' },
					{ label: 'everyday_vs_ask', without: 'everyday_vs_ask_app', with: 'everyday_vs_ask_mandate' },
					{ label: 'everyday_vs_after', without: 'everyday_vs_after_app', with: 'everyday_vs_after_mandate' },
					{ label: 'everyday_vs_vendor', without: 'everyday_vs_vendor_app', with: 'everyday_vs_vendor_mandate' }
				]
			}
		},
		{ p: 'everyday_app_not_instead' },
		{ tech: 'everyday_ha_title', text: ['everyday_ha_text_1', 'everyday_ha_text_2'] },
		{ h2: 'everyday_examples_title', id: 'examples' },
		{ p: 'everyday_examples_lead' },
		{
			examples: [
				{ icon: 'climate', title: 'everyday_ex1_title', situation: 'everyday_ex1_situation', without: 'everyday_ex1_without', rule: 'everyday_ex1_rule', decision: 'allow', result: 'everyday_ex1_result' },
				{ icon: 'media', title: 'everyday_ex2_title', situation: 'everyday_ex2_situation', without: 'everyday_ex2_without', rule: 'everyday_ex2_rule', decision: 'deny', result: 'everyday_ex2_result' },
				{ icon: 'lock', title: 'everyday_ex3_title', situation: 'everyday_ex3_situation', without: 'everyday_ex3_without', rule: 'everyday_ex3_rule', decision: 'ask', result: 'everyday_ex3_result' },
				{ icon: 'agent', title: 'everyday_ex4_title', situation: 'everyday_ex4_situation', without: 'everyday_ex4_without', rule: 'everyday_ex4_rule', decision: 'deny', result: 'everyday_ex4_result' },
				{ icon: 'limit', title: 'everyday_ex5_title', situation: 'everyday_ex5_situation', without: 'everyday_ex5_without', rule: 'everyday_ex5_rule', decision: 'deny', result: 'everyday_ex5_result' },
				{ icon: 'log', title: 'everyday_ex6_title', situation: 'everyday_ex6_situation', without: 'everyday_ex6_without', rule: 'everyday_ex6_rule', result: 'everyday_ex6_result' }
			]
		},
		{ callout: 'everyday_try_title', icon: 'play', tone: 'tip', text: ['everyday_try_text'], link: { text: 'everyday_try_link', href: '/playground/' } }
	]
};
