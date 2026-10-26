import type { TextPage } from '../types';

// Guide for one platform: what Home-Mandate for Home Assistant does and how to
// start. Install details stay in the repository, so the page links there.
const REPOSITORY = 'https://github.com/home-mandate/ha-home-mandate';

export const homeAssistant: TextPage = {
	title: 'ha_title',
	intro: 'ha_intro',
	icon: 'home',
	blocks: [
		{ callout: 'ha_status_title', icon: 'warning', tone: 'warn', text: ['ha_status_text'] },
		{ toc: 'ha_toc' },
		{ h2: 'ha_why_title', id: 'why' },
		{ p: 'ha_why_text_1' },
		{ p: 'ha_why_text_2' },
		{ h2: 'ha_how_title', id: 'how-it-works' },
		{
			process: [
				{ icon: 'agent', title: 'ha_how_agent_title', body: 'ha_how_agent_body' },
				{ icon: 'guard', title: 'ha_how_check_title', body: 'ha_how_check_body' },
				{ icon: 'phone-ask', title: 'ha_how_ask_title', body: 'ha_how_ask_body' },
				{ icon: 'home', title: 'ha_how_ha_title', body: 'ha_how_ha_body' }
			]
		},
		{ p: 'ha_how_rules' },
		{ h2: 'ha_example_title', id: 'example' },
		{ p: 'ha_example_lead' },
		{
			compare: [
				{ title: 'ha_example_allow', tone: 'allow', icon: 'allow', items: ['ha_example_allow_1', 'ha_example_allow_2', 'ha_example_allow_3'] },
				{ title: 'ha_example_ask', tone: 'ask', icon: 'ask', items: ['ha_example_ask_1', 'ha_example_ask_2'] },
				{ title: 'ha_example_deny', tone: 'deny', icon: 'deny', items: ['ha_example_deny_1', 'ha_example_deny_2'] }
			]
		},
		{ callout: 'ha_try_title', icon: 'play', tone: 'tip', text: ['ha_try_text'], link: { text: 'ha_try_link', href: '/playground/' } },
		{ h2: 'ha_features_title', id: 'features' },
		{ ul: ['ha_feature_rules', 'ha_feature_critical', 'ha_feature_approval', 'ha_feature_stop', 'ha_feature_log', 'ha_feature_token', 'ha_feature_ui'] },
		{ h2: 'ha_install_title', id: 'install' },
		{
			list: [
				{ title: 'ha_install_1_title', body: 'ha_install_1_body' },
				{ title: 'ha_install_2_title', body: 'ha_install_2_body' },
				{ title: 'ha_install_3_title', body: 'ha_install_3_body' },
				{ title: 'ha_install_4_title', body: 'ha_install_4_body' }
			]
		},
		{ p: 'ha_install_repo' },
		{ code: REPOSITORY },
		{ p: 'ha_install_guides' },
		{ h2: 'ha_remote_title', id: 'remote-access' },
		{ p: 'ha_remote_text_1' },
		{ p: 'ha_remote_text_2' },
		{ h2: 'ha_conformance_title', id: 'conformance' },
		{ p: 'ha_conformance_text' },
		{ h2: 'ha_faq_title', id: 'questions' },
		{
			faq: [
				{ id: 'which-agents', q: 'ha_faq_agents_q', a: 'ha_faq_agents_a' },
				{ id: 'assist', q: 'ha_faq_assist_q', a: 'ha_faq_assist_a' },
				{ id: 'official', q: 'ha_faq_official_q', a: 'ha_faq_official_a' },
				{ id: 'other-platforms', q: 'ha_faq_platforms_q', a: 'ha_faq_platforms_a' }
			]
		},
		{ p: 'ha_license' }
	]
};
