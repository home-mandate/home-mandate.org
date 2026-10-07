import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const LANGUAGES = [
	{ tag: 'en', prefix: '', title: 'Playground', ask: 'ask', deny: 'deny', allow: 'allow', invalid: 'Not valid', subject: 'Sprachassistent may …', tabTest: 'Test' },
	{ tag: 'de', prefix: '/de', title: 'Spielplatz', ask: 'nachfragen', deny: 'ablehnen', allow: 'erlauben', invalid: 'Ungültig', subject: 'Sprachassistent darf …', tabTest: 'Testen' }
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

const only = (info: TestInfo, ...projects: string[]) => test.skip(!projects.includes(info.project.name), `only in ${projects.join(', ')}`);

const result = (page: Page) => page.locator('#pg-result');

for (const lang of LANGUAGES) {
	test.describe(lang.tag, () => {
		test('without JavaScript: notice, link to the spec and the example in plain language', async ({ page }, info) => {
			only(info, 'no-js');
			await page.goto(`${lang.prefix}/playground/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.title);
			await expect(page.locator('.nojs')).toBeVisible();
			await expect(page.locator('.nojs a[href$="/spec/v0/"]')).toBeVisible();
			await expect(page.locator('.nojs .rules li')).toHaveCount(7);
			await expect(page.locator('.nojs .rules')).toContainText('r-locks');
			await expect(page.locator('#pg')).toBeHidden();
		});

		test('evaluates the default request with the voice assistant', async ({ page }, info) => {
			only(info, 'chromium', 'mobile');
			const problems = watch(page);
			await page.goto(`${lang.prefix}/playground/`);
			await expect(page.locator('.nojs')).toBeHidden();
			await expect(page.locator('#pg-line-chip')).toContainText(lang.ask);
			await expect(page.locator('.pg-rule')).toHaveCount(6);
			await expect(page.locator('.pg-subject').first()).toHaveText(lang.subject);
			await expect(page.locator('#pg-badge')).toHaveAttribute('data-valid', 'true');
			expect(await axe(page)).toEqual([]);
			expect(problems).toEqual([]);
		});

		test('invalid JSON shows the line, the rule and a deny for everything', async ({ page }, info) => {
			only(info, 'chromium', 'mobile');
			await page.goto(`${lang.prefix}/playground/`);
			if (info.project.name === 'mobile') await page.getByRole('tab', { name: 'JSON' }).click();
			const editor = page.locator('#pg-json');
			const text = await editor.inputValue();
			await editor.fill(text.replace('"actions": ["*"], "decision": "deny"', '"actions": ["*"], "decision": "never"'));
			await expect(page.locator('#pg-badge')).toHaveText(lang.invalid);
			const problem = page.locator('#pg-problem');
			await expect(problem).toContainText('12');
			await expect(page.locator('.pg-err-line')).toHaveText('12');
			await expect(problem).toContainText('r-no-cameras');
			await expect(problem).toContainText('decision');
			await expect(page.locator('#pg-line-chip')).toContainText(lang.deny);
			await expect(result(page).locator('[data-reason]')).toHaveAttribute('data-reason', 'invalid_mandate');
			expect(await axe(page)).toEqual([]);
			await editor.fill(text);
			await expect(page.locator('#pg-badge')).toHaveAttribute('data-valid', 'true');
			await expect(problem).toBeHidden();
		});
	});
}

test.describe('desktop', () => {
	test.beforeEach(async ({ page }, info) => {
		only(info, 'chromium');
		await page.goto('/playground/');
	});

	test('the result column sticks', async ({ page }) => {
		await expect(page.locator('.pg-side')).toHaveCSS('position', 'sticky');
		await expect(page.locator('.pg-tabs')).toBeHidden();
	});

	test('editing a rule changes the decision', async ({ page }) => {
		await expect(result(page)).toContainText('r-locks');
		await page.locator('[data-focus="3:decision"]').focus();
		await page.locator('[data-focus="3:decision"]').selectOption('deny');
		await expect(result(page).locator('.pg-verdict')).toContainText('deny');
		await expect(page.locator('[data-focus="3:decision"]')).toBeFocused();
		const doc = JSON.parse(await page.locator('#pg-json').inputValue()) as { rules: { id: string; decision: string; approval?: unknown }[] };
		expect(doc.rules[3]).toMatchObject({ id: 'r-locks', decision: 'deny' });
		expect(doc.rules[3]?.approval).toBeUndefined();
	});

	test('a critical action needs allow_critical to be allowed', async ({ page }) => {
		await page.locator('[data-focus="3:decision"]').selectOption('allow');
		await expect(result(page).locator('[data-reason]')).toHaveAttribute('data-reason', 'critical_demotion');
		await expect(page.locator('#pg-rule-3 .pg-warn')).toBeVisible();
		await page.locator('[data-focus="3:critical"]').check();
		await expect(result(page).locator('[data-reason]')).toHaveAttribute('data-reason', 'rule');
		await expect(result(page).locator('.pg-verdict')).toContainText('allow');
		await expect(page.locator('#pg-json')).toHaveValue(/"allow_critical": true/);
	});

	test('a numeric limit in hundredths of a degree', async ({ page }) => {
		await page.locator('#pg-req-category').selectOption('climate');
		await page.locator('#pg-req-action').selectOption('set_temperature');
		await page.locator('[data-focus="2:temperature:max"]').fill('22.5');
		await expect(page.locator('#pg-json')).toHaveValue(/"max": 2250/);
		await page.locator('#pg-req-value').fill('23');
		await expect(result(page).locator('.pg-verdict')).toContainText('deny');
		await expect(result(page)).toContainText('outside its limits');
		await page.locator('#pg-req-value').fill('21.5');
		await expect(result(page).locator('.pg-verdict')).toContainText('allow');
	});

	test('time windows use the household time zone', async ({ page }) => {
		await page.locator('input[name="pg-example"][value="energy"]').check({ force: true });
		await page.locator('#pg-req-category').selectOption('other');
		await page.locator('#pg-req-action').selectOption('set');
		await page.locator('.pg-more summary').click();
		await page.locator('#pg-req-entity').fill('number.wallbox_ladestrom');
		await page.locator('#pg-req-time').fill('21:59');
		await expect(result(page).locator('.pg-verdict')).toContainText('allow');
		await page.locator('#pg-req-time').fill('22:00');
		await expect(result(page).locator('.pg-verdict')).toContainText('deny');
	});

	test('build your own starts empty; rules can be added and removed', async ({ page }) => {
		await page.getByText('Build your own').click();
		await expect(page.locator('.pg-empty')).toBeVisible();
		await expect(result(page).locator('[data-reason]')).toHaveAttribute('data-reason', 'no_match');
		await page.locator('#pg-add').click();
		await expect(page.locator('.pg-rule')).toHaveCount(1);
		await expect(page.locator('#pg-badge')).toHaveAttribute('data-valid', 'true');
		await page.locator('[data-focus="0:remove"]').click();
		await expect(page.locator('.pg-empty')).toBeVisible();
		await expect(page.locator('#pg-add')).toBeFocused();
	});

	test('the overview works with the keyboard', async ({ page }) => {
		const selected = page.locator('.pg-cell[aria-pressed="true"]');
		await expect(selected).toHaveAttribute('aria-label', /locks, unlock: ask, rule r-locks/);
		await expect(page.locator('.pg-matrix th[scope="row"]')).toHaveCount(13);
		await expect(page.locator('.pg-cell[tabindex="0"]')).toHaveCount(1);
		await selected.focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('.pg-cell:focus')).toHaveAttribute('aria-label', /locks, unlock/);
		await page.keyboard.press('ArrowLeft');
		await expect(page.locator('.pg-cell:focus')).toHaveAttribute('aria-label', /locks, lock/);
		await page.keyboard.press('ArrowUp');
		await expect(page.locator('.pg-cell:focus')).toHaveAttribute('aria-label', /gate, close/);
		await page.keyboard.press('Home');
		await expect(page.locator('.pg-cell:focus')).toHaveAttribute('aria-label', /gate, read/);
		await page.keyboard.press('Enter');
		await expect(page.locator('#pg-req-category')).toHaveValue('gate');
		await expect(page.locator('#pg-req-action')).toHaveValue('read');
		await expect(page.locator('.pg-cell[aria-pressed="true"]')).toBeFocused();
		await expect(page.locator('.pg-cell[tabindex="0"]')).toHaveCount(1);
	});

	test('downloads the mandate as <id>.mandate.json', async ({ page }) => {
		const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#pg-download').click()]);
		expect(download.suggestedFilename()).toBe('m-voice-assistant.mandate.json');
	});

	test('the error links to the rule', async ({ page }) => {
		const editor = page.locator('#pg-json');
		await editor.fill((await editor.inputValue()).replace('"actions": ["disarm"]', '"actions": ["unlokc"]'));
		await expect(page.locator('#pg-problem')).toContainText('unlokc');
		await page.locator('#pg-problem .pg-link-btn').click();
		await expect(page.locator('#pg-rule-5')).toBeFocused();
	});
});

test.describe('phone', () => {
	test.beforeEach(async ({ browserName: _browser }, info) => {
		only(info, 'mobile');
	});

	test('4a rules (dark): tabs and result line', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto('/playground/');
		await expect(page.getByRole('tab', { name: 'Rules' })).toHaveAttribute('aria-selected', 'true');
		await expect(page.locator('#pg-line-text')).toHaveText('locks · unlock · Wed 19:00');
		await expect(page.locator('#pg-panel-rules')).toBeVisible();
		await expect(page.locator('#pg-panel-test')).toBeHidden();
		await expect(page.locator('.pg-bar')).toHaveCSS('position', 'sticky');
		expect(await axe(page)).toEqual([]);
	});

	test('4b test (light, German)', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto('/de/playground/');
		await page.getByRole('tab', { name: 'Testen' }).click();
		await expect(page.locator('#pg-panel-test')).toBeVisible();
		await expect(page.locator('#pg-panel-rules')).toBeHidden();
		await expect(page.locator('#pg-result .pg-verdict')).toContainText('nachfragen');
		await expect(page.locator('#pg-line-text')).toHaveText('Schlösser · entriegeln · Mi 19:00');
		expect(await axe(page)).toEqual([]);
	});

	test('4c overview scrolls inside itself; a tap opens the test', async ({ page }) => {
		await page.goto('/playground/');
		const tab = page.getByRole('tab', { name: 'Overview' });
		await tab.focus();
		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('tab', { name: 'Test' })).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await expect(tab).toHaveAttribute('aria-selected', 'true');
		const scroller = page.locator('#pg-matrix');
		const overflow = await scroller.evaluate((el) => el.scrollWidth > el.clientWidth);
		expect(overflow).toBe(true);
		const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
		expect(pageOverflow).toBe(false);
		await expect(page.locator('.pg-matrix tbody th').first()).toHaveCSS('position', 'sticky');
		expect(await axe(page)).toEqual([]);
		await page.locator('.pg-cell[aria-label^="lights, turn on"]').click();
		await expect(page.getByRole('tab', { name: 'Test' })).toHaveAttribute('aria-selected', 'true');
		await expect(page.locator('#pg-line-text')).toHaveText('lights · turn on · Wed 19:00');
	});

	test('4d JSON not valid', async ({ page }) => {
		await page.goto('/playground/');
		await page.getByRole('tab', { name: 'JSON' }).click();
		const editor = page.locator('#pg-json');
		await editor.fill((await editor.inputValue()).replace('"default": "deny",', '"default": "deny"'));
		await expect(page.locator('#pg-badge')).toHaveText('Not valid');
		await expect(page.locator('#pg-problem')).toContainText('Line 16');
		await expect(page.locator('.pg-err-line')).toHaveText('16');
	});

	test('4e rules in German', async ({ page }) => {
		await page.goto('/de/playground/');
		await expect(page.locator('.pg-subject').first()).toHaveText('Sprachassistent darf …');
		await expect(page.locator('.pg-words').first()).toContainText('Jedes Gerät: Sprachassistent darf lesen.');
		const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
		expect(pageOverflow).toBe(false);
	});
});
