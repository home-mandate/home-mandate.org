import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// The Relay Specification on the site: the reader (/relay/v0/), the page for
// implementers (/implement/relay/), the error types, the identifier pages, the
// section on how-it-works and the changelog.
const LANGUAGES = [
	{ tag: 'en', prefix: '', implement: 'Reachable from outside, without having to trust the relay', errors: 'Error types of the Relay Specification', remote: 'Reachable on the go – through a relay', core: 'Core', relay: 'Relay' },
	{ tag: 'de', prefix: '/de', implement: 'Von außen erreichbar, ohne dem Relay vertrauen zu müssen', errors: 'Fehlertypen der Relay-Spezifikation', remote: 'Von unterwegs erreichbar – über ein Relay', core: 'Kern', relay: 'Relay' }
];
const PAGES = ['/relay/v0/', '/implement/relay/', '/relay/errors/', '/relay/errors/bad-nonce/', '/changelog/relay/'];
const CLASSES = ['metadata', 'enrollment', 'dns', 'relay', 'issuance'];

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

		test('/relay/v0/ shows the Relay Specification with its diagrams and the switch to the core', async ({ page }) => {
			await page.goto(`${lang.prefix}/relay/v0/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Home-Mandate Relay Specification v0/);
			await expect(page.locator('figure.sequence')).toHaveCount(2);
			await expect(page.locator('figure.sequence').first()).toHaveAttribute('aria-label', /Gateway/);
			const docs = page.locator('nav.docs:visible');
			await expect(docs).toHaveCount(1);
			await expect(docs.locator('[aria-current="page"]')).toHaveText(lang.relay);
			await expect(docs.getByRole('link', { name: lang.core })).toHaveAttribute('href', `${lang.prefix}/spec/v0/`);
			await expect(page.locator('[id="51-directory-nonces-and-requests"]')).toBeAttached();
		});

		test('/implement/relay/ shows the classes, the test tool and the downloads', async ({ page }) => {
			await page.goto(`${lang.prefix}/implement/relay/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.implement);
			const tabs = page.getByRole('navigation', { name: lang.tag === 'en' ? 'Implement section' : 'Bereich Implementieren' });
			await expect(tabs.locator('[aria-current="page"]')).toHaveAttribute('href', `${lang.prefix}/implement/relay/`);
			await expect(page.locator('.class-id')).toHaveText(CLASSES);
			await expect(page.locator('#relay-cmd-install')).toHaveText(/^go install github\.com\/home-mandate\/relay-spec\/cmd\/relay-conformance@v\d+\.\d+\.\d+$/);
			await expect(page.locator('.dl-grid article')).toHaveCount(2);
			await expect(page.locator('.dl-grid a.dl-more')).toHaveAttribute('href', `${lang.prefix}/relay/errors/`);
		});

		test('/relay/errors/ lists every error type, each with a page of its own', async ({ page }) => {
			await page.goto(`${lang.prefix}/relay/errors/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.errors);
			await expect(page.locator('.errors > li')).toHaveCount(13);
			await page.goto(`${lang.prefix}/relay/errors/bad-nonce/`);
			await expect(page.locator('li.current .name')).toHaveText('bad-nonce');
			await expect(page.locator('li.current .status')).toHaveText('HTTP 400');
			await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
		});

		test('/how-it-works/ explains reaching the home through a relay', async ({ page }) => {
			await page.goto(`${lang.prefix}/how-it-works/#remote`);
			await expect(page.getByRole('heading', { level: 2, name: lang.remote })).toBeVisible();
			const read = page.locator('#remote').getByRole('link', { name: lang.tag === 'en' ? /Read the Relay Specification/ : /Relay-Spezifikation lesen/ });
			await expect(read).toHaveAttribute('href', `${lang.prefix}/relay/v0/`);
		});

		test('/changelog/relay/ shows the changelog of the Relay Specification with its own feed', async ({ page }) => {
			await page.goto(`${lang.prefix}/changelog/relay/`);
			await expect(page.locator('link[rel=alternate][type="application/atom+xml"]')).toHaveAttribute('href', '/changelog/relay/feed.xml');
			await expect(page.locator('.changelog article').first().locator('.version')).toHaveText(/^v0\.\d+\.\d+/);
			await expect(page.locator('.changelog .in-spec').first()).toHaveAttribute('href', new RegExp(`^${lang.prefix}/relay/v0/#`));
		});
	});
}

test('the relay identifier pages link to their schemas, served under their $id', async ({ page }) => {
	for (const [path, file] of [
		['relay-metadata/v0', 'metadata.schema.json'],
		['relay-enrollment/v0', 'enrollment.schema.json']
	]) {
		await page.goto(`/${path}/`);
		await expect(page.getByRole('link', { name: 'Download schema' })).toHaveAttribute('href', `/${path}/${file}`);
		const response = await page.request.get(`/${path}/${file}`);
		expect((await response.json()).$id).toBe(`https://home-mandate.org/${path}/${file}`);
	}
});

test('the feed of the relay changelog is Atom with entries that link to the changelog', async ({ request }) => {
	const xml = await (await request.get('/changelog/relay/feed.xml')).text();
	expect(xml).toContain('<title>Home-Mandate Relay Specification changelog</title>');
	expect(xml).toMatch(/<entry>/);
	expect(xml).toContain('https://home-mandate.org/changelog/relay/#');
});

test('the status band names the core and the relay version', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.band')).toContainText(/^Specification v\d+\.\d+ · Relay v\d+\.\d+ · open · vendor-neutral$/);
});

for (const path of ['/de/implement/relay/', '/de/how-it-works/', '/de/relay/v0/', '/de/relay/errors/', '/de/changelog/relay/', '/de/changelog/']) {
	test(`${path} fits a 320 px screen`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 800 });
		await page.goto(path);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
	});
}
