import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/', '/imprint/', '/privacy/', '/mandate/v0/', '/audit/v0/', '/audit-checkpoint/v0/'];
const LANGUAGES = [
	{ tag: 'en', prefix: '', title: 'AI is coming home. Decide what it may do.', name: 'English' },
	{ tag: 'de', prefix: '/de', title: 'KI kommt nach Hause. Bestimme, was sie darf.', name: 'Deutsch' }
];

/** Collects CSP violations and console errors while a test runs. */
function watch(page: Page): string[] {
	const problems: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') problems.push(msg.text());
	});
	page.on('pageerror', (err) => problems.push(err.message));
	return problems;
}

for (const lang of LANGUAGES) {
	test.describe(`${lang.tag}`, () => {
		test('home page shows the message and the three decisions', async ({ page }) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/`);
			await expect(page.locator('html')).toHaveAttribute('lang', lang.tag);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.title);
			await expect(page.locator('[data-decision]')).toHaveCount(3);
			expect(problems).toEqual([]);
		});

		for (const path of PAGES) {
			test(`${path} has no accessibility violations`, async ({ page }, info) => {
				test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
				await page.goto(`${lang.prefix}${path}`);
				const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
				expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
			});
		}

		test('every page names its other languages (hreflang)', async ({ page }) => {
			await page.goto(`${lang.prefix}/imprint/`);
			for (const other of LANGUAGES) {
				await expect(page.locator(`link[rel=alternate][hreflang=${other.tag}]`)).toHaveAttribute(
					'href',
					`https://mandate-spec.org${other.prefix}/imprint/`
				);
			}
		});
	});
}

test('language menu switches to the same page in another language', async ({ page }) => {
	await page.goto('/imprint/');
	// Desktop header and phone header each have a picker; use the visible one.
	const picker = page.locator('header details.lang:visible').first();
	await picker.locator('summary').click();
	await picker.getByRole('link', { name: 'Deutsch' }).click();
	await expect(page).toHaveURL(/\/de\/imprint\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum');
});

test('identifier page links to its schema', async ({ page }) => {
	await page.goto('/mandate/v0/');
	const link = page.getByRole('link', { name: 'JSON Schema' });
	await expect(link).toHaveAttribute('href', '/mandate/v0/mandate.schema.json');
	const response = await page.request.get('/mandate/v0/mandate.schema.json');
	expect((await response.json()).$id).toBe('https://mandate-spec.org/mandate/v0/mandate.schema.json');
});

test('checkpoint identifier has no schema link', async ({ page }) => {
	await page.goto('/audit-checkpoint/v0/');
	await expect(page.getByRole('link', { name: 'JSON Schema' })).toHaveCount(0);
});

test('version.json names the commit', async ({ request }) => {
	const body = await (await request.get('/version.json')).json();
	expect(body.commit).toMatch(/^[0-9a-f]{40}$/);
});

test('no cookies and no storage are used', async ({ page, context }) => {
	await page.goto('/');
	await page.goto('/de/privacy/');
	expect(await context.cookies()).toEqual([]);
	expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});

test('the theme switch stores only ms-theme, only after a choice, and system removes it', async ({ page, context }, info) => {
	test.skip(info.project.name === 'no-js', 'the switch needs JavaScript');
	await page.goto('/');
	expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
	const group = info.project.name === 'mobile' ? 'theme-menu' : 'theme-header';
	if (info.project.name === 'mobile') await page.locator('details[data-popover="menu"] > summary').click();
	await page.locator(`input[name="${group}"][value="dark"]`).check({ force: true });
	await expect(page.locator('html')).toHaveAttribute('data-ms-theme', 'dark');
	expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([['ms-theme', 'dark']]);
	// The choice survives a reload without flashing the system theme first.
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-ms-theme', 'dark');
	if (info.project.name === 'mobile') await page.locator('details[data-popover="menu"] > summary').click();
	await page.locator(`input[name="${group}"][value="system"]`).check({ force: true });
	await expect(page.locator('html')).not.toHaveAttribute('data-ms-theme', /.*/);
	expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
	expect(await context.cookies()).toEqual([]);
});
