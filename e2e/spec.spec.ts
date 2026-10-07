import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LANGUAGES = [
	{ tag: 'en', prefix: '', english: false, changelog: 'Changelog', feed: 'Atom feed' },
	{ tag: 'de', prefix: '/de', english: true, changelog: 'Änderungsprotokoll', feed: 'Atom-Feed' }
];

function watch(page: Page): string[] {
	const problems: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') problems.push(msg.text());
	});
	page.on('pageerror', (err) => problems.push(err.message));
	return problems;
}

async function axe(page: Page): Promise<string[]> {
	const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
	return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`);
}

for (const lang of LANGUAGES) {
	test.describe(`spec ${lang.tag}`, () => {
		test('shows the English specification with GitHub anchors', async ({ page }) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/spec/v0/`);
			await expect(page.locator('html')).toHaveAttribute('lang', lang.tag);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^mandate-spec v0/);
			await expect(page.locator('article[lang=en]')).toBeVisible();
			await expect(page.locator('h2[id="3-data-model"]')).toContainText('Data model');
			await expect(page.locator('h3[id="31-validity-of-a-mandate"]')).toBeAttached();
			await expect(page.locator('strong.kw', { hasText: /^MUST NOT$/ }).first()).toBeAttached();
			await expect(page.locator('[role=note]')).toHaveCount(lang.english ? 1 : 0);
			// The SPDX comment at the top of SPEC-v0.md is dropped, not rendered.
			expect(await page.content()).not.toContain('SPDX-License-Identifier');
			expect(problems).toEqual([]);
		});

		test('links to the file on GitHub at the imported tag', async ({ page }, info) => {
			await page.goto(`${lang.prefix}/spec/v0/`);
			const link = info.project.name === 'mobile' ? page.locator('a.github-phone') : page.locator('.bar a.github');
			await expect(link).toHaveAttribute('href', /^https:\/\/github\.com\/mandate-spec\/mandate-spec\/blob\/v0\.[^/]+\/SPEC-v0\.md$/);
		});

		test('spec has no accessibility violations', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
			await page.goto(`${lang.prefix}/spec/v0/`);
			expect(await axe(page)).toEqual([]);
		});

		test('changelog lists the versions from the specification', async ({ page }) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/changelog/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.changelog);
			await expect(page.locator('link[rel=alternate][type="application/atom+xml"]')).toHaveAttribute('href', '/changelog/feed.xml');
			await expect(page.getByRole('link', { name: lang.feed })).toHaveAttribute('href', '/changelog/feed.xml');
			await expect(page.locator('.changelog article')).not.toHaveCount(0);
			await expect(page.locator('.changelog article').first().locator('.kind').first()).toBeVisible();
			expect(problems).toEqual([]);
		});

		test('changelog has no accessibility violations', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
			await page.goto(`${lang.prefix}/changelog/`);
			expect(await axe(page)).toEqual([]);
		});
	});
}

test('every imported release has its own address', async ({ page }) => {
	await page.goto('/spec/v0/');
	const tag = (await page.locator('article .tag').textContent())?.trim() ?? '';
	const response = await page.goto(`/spec/v0/${tag}/`);
	expect(response?.status()).toBe(200);
	await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
});

test('the Atom feed is valid XML with entries', async ({ request }) => {
	const response = await request.get('/changelog/feed.xml');
	expect(response.status()).toBe(200);
	const xml = await response.text();
	expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
	expect(xml).toMatch(/<entry>[\s\S]*<updated>\d{4}-\d{2}-\d{2}T00:00:00Z<\/updated>/);
	expect(xml).not.toMatch(/<(script|code|li)\b/);
});

test.describe('with JavaScript', () => {
	test.skip(({ javaScriptEnabled }) => !javaScriptEnabled, 'needs JavaScript');

	test('marks the section in view', async ({ page }, info) => {
		await page.goto('/spec/v0/#4-evaluation-rule');
		const variant = info.project.name === 'mobile' ? 'sheet' : 'side';
		const current = page.locator(`.toc.${variant} a[aria-current=location]`);
		await expect(current).toHaveAttribute('href', '#4-evaluation-rule');
		await page.evaluate(() => document.getElementById('9-audit-log')?.scrollIntoView());
		await expect(current).toHaveAttribute('href', '#9-audit-log');
		if (variant === 'side') await expect(page.locator('.crumbs [data-spec-current]')).toHaveText('Audit log');
		else await expect(page.locator('.toc-sheet summary')).toContainText('9 Audit log');
	});

	test('print button opens the print dialog', async ({ page }, info) => {
		test.skip(info.project.name === 'mobile', 'the print button is a desktop control');
		await page.goto('/spec/v0/');
		await page.evaluate(() => {
			(window as unknown as { printed: boolean }).printed = false;
			window.print = () => {
				(window as unknown as { printed: boolean }).printed = true;
			};
		});
		await page.getByRole('button', { name: 'Print view' }).click();
		expect(await page.evaluate(() => (window as unknown as { printed: boolean }).printed)).toBe(true);
	});

	test('phone contents jump to a section and close', async ({ page }, info) => {
		test.skip(info.project.name !== 'mobile', 'phone layout');
		await page.goto('/spec/v0/');
		const sheet = page.locator('details.toc-sheet');
		await sheet.locator('summary').click();
		await sheet.getByRole('link', { name: /Audit log/ }).first().click();
		await expect(page).toHaveURL(/#9-audit-log$/);
		await expect(sheet).not.toHaveAttribute('open');
	});

	test('tables scroll inside their box on phones', async ({ page }, info) => {
		test.skip(info.project.name !== 'mobile', 'phone layout');
		await page.goto('/spec/v0/');
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow).toBeLessThanOrEqual(0);
	});
});

test('without JavaScript the print button is hidden and the contents work', async ({ page }, info) => {
	test.skip(info.project.name !== 'no-js', 'no-js project');
	await page.goto('/spec/v0/');
	await expect(page.getByRole('button', { name: 'Print view' })).toBeHidden();
	await page.locator('.toc.side').getByRole('link', { name: /Audit log/ }).first().click();
	await expect(page).toHaveURL(/#9-audit-log$/);
});

test('print layout hides the navigation and shows version and address', async ({ page }, info) => {
	test.skip(info.project.name !== 'chromium', 'one browser is enough');
	await page.goto('/spec/v0/');
	await page.emulateMedia({ media: 'print' });
	await expect(page.locator('header.header')).toBeHidden();
	await expect(page.locator('aside.side')).toBeHidden();
	await expect(page.locator('.bar')).toBeHidden();
	await expect(page.locator('.print-head')).toBeVisible();
	await expect(page.locator('.print-head')).toContainText('mandate-spec.org/spec/v0/');
});
