import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LANGUAGES = [
	{ tag: 'en', prefix: '', title: 'How it works', deny: 'deny', json: 'JSON', tamper: 'Change entry 2', restore: 'Undo change', broken: 'doesn’t match' },
	{ tag: 'de', prefix: '/de', title: 'So funktioniert’s', deny: 'ablehnen', json: 'JSON', tamper: 'Eintrag 2 ändern', restore: 'Änderung zurücknehmen', broken: 'passt nicht' }
];

function watch(page: Page): string[] {
	const problems: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') problems.push(msg.text());
	});
	page.on('pageerror', (err) => problems.push(err.message));
	return problems;
}

const path = (page: Page) => page.locator('[data-how-path]');
const chain = (page: Page) => page.locator('[data-how-chain]');

for (const lang of LANGUAGES) {
	test.describe(lang.tag, () => {
		test('shows all five sections without errors', async ({ page }) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/how-it-works/`);
			await expect(page.locator('html')).toHaveAttribute('lang', lang.tag);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.title);
			await expect(page.getByRole('heading', { level: 2 })).toHaveCount(5);
			await expect(page.locator('.tiles li')).toHaveCount(5);
			await expect(page.locator('.plain li')).toHaveCount(7);
			await expect(page.locator('.critical li')).toHaveCount(8);
			await expect(page.locator('.chain > li')).toHaveCount(4);
			expect(problems).toEqual([]);
		});

		test('has no accessibility violations', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
			await page.goto(`${lang.prefix}/how-it-works/`);
			const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
			expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
		});

		test('switches the path of a request', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'needs JavaScript');
			await page.goto(`${lang.prefix}/how-it-works/`);
			await expect(path(page)).toHaveAttribute('data-path', 'ask');
			await page.getByRole('radio', { name: lang.deny, exact: true }).check();
			await expect(path(page)).toHaveAttribute('data-path', 'deny');
			await expect(page.locator('.explain [data-when="deny"]')).toBeVisible();
			await expect(page.locator('.explain [data-when="ask"]')).toBeHidden();
			await expect(page.locator('.device [data-when="deny"].sub')).toBeVisible();
		});

		test('switches the tamper demo', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'needs JavaScript');
			await page.goto(`${lang.prefix}/how-it-works/`);
			const button = page.getByRole('button', { name: lang.tamper });
			await button.click();
			await expect(chain(page)).toHaveAttribute('data-tampered', '');
			await expect(page.getByRole('status').getByText(lang.broken === 'passt nicht' ? 'Änderung entdeckt.' : 'Change detected.')).toBeVisible();
			await expect(page.locator('.chain').getByText(lang.broken, { exact: true })).toHaveCount(1);
			await page.getByRole('button', { name: lang.restore }).click();
			await expect(chain(page)).not.toHaveAttribute('data-tampered');
		});
	});
}

test('radio group and tabs work with the keyboard', async ({ page }, info) => {
	test.skip(info.project.name !== 'chromium', 'keyboard test on desktop');
	await page.goto('/how-it-works/');
	await page.getByRole('radio', { name: 'ask' }).focus();
	await page.keyboard.press('ArrowRight');
	await expect(path(page)).toHaveAttribute('data-path', 'deny');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await expect(path(page)).toHaveAttribute('data-path', 'allow');

	const plain = page.getByRole('tab', { name: 'Plain language' });
	await plain.focus();
	await page.keyboard.press('ArrowRight');
	const json = page.getByRole('tab', { name: 'JSON' });
	await expect(json).toBeFocused();
	await expect(json).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('#how-panel-json')).toBeVisible();
	await expect(page.locator('#how-panel-plain')).toBeHidden();
	await page.keyboard.press('Home');
	await expect(plain).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('#how-panel-plain')).toBeVisible();
});

test('the JSON view shows a mandate whose rules match the plain-language rows', async ({ page }) => {
	await page.goto('/how-it-works/');
	const text = await page.locator('#how-mandate-json').textContent();
	const mandate = JSON.parse(text ?? '') as { rules: { decision: string }[]; default: string };
	const chips = await page.locator('.plain li .chip').allTextContents();
	expect(chips.map((c) => c.trim())).toEqual([...mandate.rules.map((r) => r.decision), mandate.default]);
});

test('without JavaScript the ask path, both views and the intact chain are shown', async ({ page }, info) => {
	test.skip(info.project.name !== 'no-js', 'no-js only');
	await page.goto('/how-it-works/');
	await expect(path(page)).toHaveAttribute('data-path', 'ask');
	await expect(page.locator('.explain [data-when="ask"]')).toBeVisible();
	await expect(page.locator('.picker')).toBeHidden();
	await expect(page.getByRole('tablist')).toBeHidden();
	await expect(page.locator('#how-panel-plain')).toBeVisible();
	await expect(page.locator('#how-panel-json')).toBeVisible();
	await expect(page.locator('[data-tamper]')).toBeHidden();
	await expect(page.locator('.status .ok')).toBeVisible();
	await expect(page.locator('.status .bad')).toBeHidden();
});
