import { expect, test } from '@playwright/test';

const LANGUAGES = [
	{ prefix: '', title: 'In everyday life', compare: 'Isn’t my smart home app enough?', words: ['allow', 'deny', 'ask', 'deny', 'deny'] },
	{ prefix: '/de', title: 'Im Alltag', compare: 'Reicht dafür nicht meine Smart-Home-App?', words: ['erlauben', 'ablehnen', 'nachfragen', 'ablehnen', 'ablehnen'] }
];

for (const lang of LANGUAGES) {
	test.describe(lang.prefix || '/', () => {
		test('everyday page compares the app with a mandate and shows six examples', async ({ page }) => {
			await page.goto(`${lang.prefix}/everyday/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.title);
			await expect(page.getByRole('heading', { level: 2, name: lang.compare })).toBeVisible();
			await expect(page.locator('.versus-row')).toHaveCount(7);
			const examples = page.locator('article.example');
			await expect(examples).toHaveCount(6);
			const chips = examples.locator('.chip');
			await expect(chips).toHaveCount(lang.words.length);
			for (const [i, word] of lang.words.entries()) await expect(chips.nth(i)).toHaveText(word, { ignoreCase: true });
		});
	});
}

test('everyday page has no horizontal scroll', async ({ page }) => {
	for (const width of [375, 768, 1024, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/de/everyday/');
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow, `width ${width}`).toBeLessThanOrEqual(0);
	}
});

test('home page and FAQ lead to the everyday page', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('a[href="/everyday/"]').first()).toBeVisible();
	await page.goto('/de/faq/');
	await expect(page.locator('#app a[href="/de/everyday/"]')).toHaveCount(1);
});
