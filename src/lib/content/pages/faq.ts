import type { TextPage } from '../types';

export const faq: TextPage = {
	title: 'faq_title',
	intro: 'faq_intro',
	blocks: [
		{ faq: [
			{ id: 'data', q: 'faq_data_q', a: 'faq_data_a' },
			{ id: 'tricked', q: 'faq_tricked_q', a: 'faq_tricked_a' },
			{ id: 'product', q: 'faq_product_q', a: 'faq_product_a' },
			{ id: 'owner', q: 'faq_owner_q', a: 'faq_owner_a' },
			{ id: 'no-answer', q: 'faq_no_answer_q', a: 'faq_no_answer_a' },
			{ id: 'matter', q: 'faq_matter_q', a: 'faq_matter_a' },
			{ id: 'app', q: 'faq_app_q', a: 'faq_app_a' }
		] }
	]
};
