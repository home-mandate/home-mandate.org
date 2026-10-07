import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

const LANGUAGES = [
	{ tag: 'en', prefix: '', implement: 'Implement mandate-spec', list: 'Implementations', all: 'All', library: 'Library', guard: 'Home guard', show: 'Show' },
	{ tag: 'de', prefix: '/de', implement: 'mandate-spec implementieren', list: 'Implementierungen', all: 'Alle', library: 'Bibliothek', guard: 'Wächter', show: 'Zeigen' }
];
const PAGES = ['/implement/', '/implementations/'];

function watch(page: Page): string[] {
	const problems: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') problems.push(msg.text());
	});
	page.on('pageerror', (err) => problems.push(err.message));
	return problems;
}

for (const lang of LANGUAGES) {
	test.describe(lang.tag, () => {
		for (const path of PAGES) {
			test(`${path} has no accessibility violations and no console errors`, async ({ page }, info) => {
				test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
				const problems = watch(page);
				await page.goto(`${lang.prefix}${path}`);
				const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
				expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
				expect(problems).toEqual([]);
			});
		}

		test('/implement/ shows the data model, the classes, the commands and the downloads', async ({ page }) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/implement/`);
			await expect(page.locator('html')).toHaveAttribute('lang', lang.tag);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.implement);
			const tabs = page.getByRole('navigation', { name: lang.tag === 'en' ? 'Implement section' : 'Bereich Implementieren' });
			await expect(tabs.locator('[aria-current="page"]')).toHaveAttribute('href', `${lang.prefix}/implement/`);

			const mandate = page.getByRole('table', { name: 'Mandate' });
			await expect(mandate.getByRole('rowheader', { name: 'principal' })).toBeVisible();
			await expect(page.getByRole('table', { name: 'Rule' }).getByRole('rowheader', { name: 'allow_critical' })).toBeVisible();

			await expect(page.locator('.class-id')).toHaveText(['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored', 'pdp']);
			await expect(page.locator('#cmd-install')).toHaveText(/^go install github\.com\/mandate-spec\/mandate-spec\/cmd\/mandate-conformance@v\d/);

			const links = page.locator('a[download]');
			await expect(links).toHaveCount(3);
			for (const card of await page.locator('.dl-grid article').all()) {
				const href = (await card.locator('a[download]').getAttribute('href')) ?? '';
				const body = await (await page.request.get(href)).body();
				const sha = createHash('sha256').update(body).digest('hex');
				await expect(card.locator('.short')).toHaveText(`${sha.slice(0, 8)}…${sha.slice(-4)}`);
				await expect(card.locator('.full')).toHaveText(sha);
			}
			expect(problems).toEqual([]);
		});

		test('the full checksum opens with "Show"', async ({ page }) => {
			await page.goto(`${lang.prefix}/implement/`);
			const card = page.locator('article').first();
			await expect(card.locator('.full')).toBeHidden();
			await card.locator('summary').click();
			await expect(card.locator('.full')).toBeVisible();
			await expect(card.locator('.full')).toHaveText(/^[0-9a-f]{64}$/);
		});

		test('/implementations/ lists the entries with declared classes', async ({ page }, info) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/implementations/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.list);
			const entries = info.project.name === 'mobile' ? page.locator('.cards [data-kinds]') : page.locator('tbody [data-kinds]');
			await expect(entries).toHaveCount(2);
			await expect(entries.first()).toBeVisible();
			await expect(entries.first().locator('.badge').first()).toContainText('evaluator');
			await expect(page.locator('a[href="https://github.com/mandate-spec/mandate-spec.org/pulls"]')).toBeVisible();
			expect(problems).toEqual([]);
		});

		test('the kind filter shows matching entries', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'the filter needs JavaScript');
			await page.goto(`${lang.prefix}/implementations/`);
			const entries = info.project.name === 'mobile' ? page.locator('.cards [data-kinds]') : page.locator('tbody [data-kinds]');
			const empty = info.project.name === 'mobile' ? page.locator('.cards [data-empty]') : page.locator('tbody [data-empty]');
			const pill = (name: string) => page.locator('button[data-filter]', { hasText: name });

			await expect(pill(lang.all)).toHaveAttribute('aria-pressed', 'true');
			await pill(lang.guard).click();
			await expect(pill(lang.guard)).toHaveAttribute('aria-pressed', 'true');
			await expect(pill(lang.all)).toHaveAttribute('aria-pressed', 'false');
			await expect(entries.filter({ visible: true })).toHaveCount(0);
			await expect(empty).toBeVisible();
			await expect(page.locator('[data-filter-status]')).toHaveText(lang.tag === 'en' ? '0 of 2 shown' : '0 von 2 angezeigt');

			await pill(lang.library).click();
			await expect(entries.filter({ visible: true })).toHaveCount(2);
			await expect(empty).toBeHidden();
			await pill('Tool').or(pill('Werkzeug')).click();
			await expect(entries.filter({ visible: true })).toHaveCount(1);
			await pill(lang.all).click();
			await expect(entries.filter({ visible: true })).toHaveCount(2);
		});
	});
}

test('without JavaScript the filter is hidden and every entry is shown', async ({ page }, info) => {
	test.skip(info.project.name !== 'no-js', 'only without JavaScript');
	await page.goto('/implementations/');
	await expect(page.locator('[data-filters]')).toBeHidden();
	await expect(page.locator('tbody [data-kinds]').filter({ visible: true })).toHaveCount(2);
	await expect(page.locator('tbody [data-empty]')).toBeHidden();
	await page.goto('/implement/');
	await expect(page.locator('.command .copy').first()).toBeHidden();
	await expect(page.locator('#cmd-install')).toBeVisible();
	await page.locator('.dl-grid summary').first().click();
	await expect(page.locator('.dl-grid .full').first()).toBeVisible();
});

test('copy buttons copy the command and the checksum', async ({ page, context }, info) => {
	test.skip(info.project.name !== 'chromium', 'clipboard permissions in desktop Chromium');
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/implement/');
	const command = page.locator('.command').first();
	await command.getByRole('button').click();
	await expect(command.locator('.copy')).toHaveAttribute('data-copied', 'true');
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await page.locator('#cmd-install').textContent());

	const card = page.locator('article').first();
	await card.locator('.copy').click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await card.locator('.full').textContent());
});
