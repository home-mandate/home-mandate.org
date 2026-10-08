import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LANGUAGES = [
	{
		tag: 'en',
		prefix: '',
		title: 'AI is coming home. Decide what it may do.',
		playground: 'Try the playground',
		how: 'How it works',
		words: ['allow', 'allow', 'allow', 'ask', 'deny', 'deny', 'deny'],
		allImpl: 'All implementations',
		addImpl: 'Add yours via pull request.'
	},
	{
		tag: 'de',
		prefix: '/de',
		title: 'KI kommt nach Hause. Bestimme, was sie darf.',
		playground: 'Spielplatz ausprobieren',
		how: 'So funktioniert’s',
		words: ['erlauben', 'erlauben', 'erlauben', 'nachfragen', 'ablehnen', 'ablehnen', 'ablehnen'],
		allImpl: 'Alle Implementierungen',
		addImpl: 'Per Pull Request eintragen.'
	}
];

function watch(page: Page): string[] {
	const problems: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') problems.push(msg.text());
	});
	page.on('pageerror', (err) => problems.push(err.message));
	return problems;
}

for (const lang of LANGUAGES) {
	test.describe(`home ${lang.tag}`, () => {
		test('hero links to the playground and to how it works', async ({ page }) => {
			const problems = watch(page);
			await page.goto(`${lang.prefix}/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.title);
			await expect(page.getByRole('link', { name: lang.playground })).toHaveAttribute('href', `${lang.prefix}/playground/`);
			await expect(page.getByRole('link', { name: lang.how, exact: true }).first()).toHaveAttribute(
				'href',
				`${lang.prefix}/how-it-works/`
			);
			expect(problems).toEqual([]);
		});

		test('mandate card shows seven rules with their decisions', async ({ page }) => {
			await page.goto(`${lang.prefix}/`);
			const rows = page.locator('figure li');
			await expect(rows).toHaveCount(7);
			await expect(rows.locator('.chip')).toHaveText(lang.words);
			await expect(page.locator('figure li[data-rule="default"] .chip')).toHaveClass(/deny/);
		});

		test('three decisions, three steps, three entry points', async ({ page }) => {
			await page.goto(`${lang.prefix}/`);
			await expect(page.locator('[data-decision]')).toHaveCount(3);
			const steps = page.locator('section[aria-labelledby="scenario-title"] ol > li');
			await expect(steps).toHaveCount(3);
			await expect(page.locator('section[aria-labelledby="scenario-title"] [role="img"]')).toHaveCount(3);
			const entries = page.locator('section[aria-labelledby="start-title"] a');
			await expect(entries).toHaveCount(3);
			const hrefs = await entries.evaluateAll((links) => links.map((a) => a.getAttribute('href')));
			expect(hrefs).toEqual([`${lang.prefix}/why/`, `${lang.prefix}/playground/`, `${lang.prefix}/spec/v0/`]);
		});

		test('open and neutral lists four facts', async ({ page }) => {
			await page.goto(`${lang.prefix}/`);
			const facts = page.locator('section[aria-labelledby="open-title"] dl > div');
			await expect(facts).toHaveCount(4);
			await expect(facts.locator('dd').first()).toHaveText('CC BY 4.0');
		});

		test('implementations show declared classes and link onwards', async ({ page }) => {
			await page.goto(`${lang.prefix}/`);
			const section = page.locator('section[aria-labelledby="impl-title"]');
			const rows = section.locator('ul > li');
			expect(await rows.count()).toBeGreaterThan(0);
			expect(await rows.count()).toBeLessThanOrEqual(3);
			await expect(rows.first().locator('.badge').first()).toHaveText('evaluator');
			await expect(section.getByRole('link', { name: lang.allImpl })).toHaveAttribute('href', `${lang.prefix}/implementations/`);
			await expect(section.getByRole('link', { name: lang.addImpl })).toHaveAttribute(
				'href',
				'https://github.com/home-mandate/home-mandate.org/blob/main/src/lib/content/implementations.ts'
			);
		});

		test('uses the full footer', async ({ page }) => {
			await page.goto(`${lang.prefix}/`);
			await expect(page.locator('footer.footer.full')).toHaveCount(1);
		});

		test('has no accessibility violations', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
			await page.goto(`${lang.prefix}/`);
			const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
			expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
		});

		test('has no accessibility violations in dark mode', async ({ page }, info) => {
			test.skip(info.project.name === 'no-js', 'axe needs JavaScript');
			await page.emulateMedia({ colorScheme: 'dark' });
			await page.goto(`${lang.prefix}/`);
			const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
			expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
		});
	});
}

test('home page has no horizontal scroll', async ({ page }) => {
	for (const width of [375, 768, 1024, 1280, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/de/');
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow, `width ${width}`).toBeLessThanOrEqual(0);
	}
});

test('phone layout: buttons full width, card below the buttons', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');
	const primary = await page.locator('.hero .btn-primary').boundingBox();
	const secondary = await page.locator('.hero .btn-secondary').boundingBox();
	const card = await page.locator('.hero figure').boundingBox();
	const intro = await page.locator('.hero h1').boundingBox();
	expect(primary!.width).toBeCloseTo(intro!.width, 0);
	expect(secondary!.y).toBeGreaterThan(primary!.y);
	expect(card!.y).toBeGreaterThan(secondary!.y + secondary!.height);
	expect(primary!.height).toBeGreaterThanOrEqual(44);
});
