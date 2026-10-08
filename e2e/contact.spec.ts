import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Request, type TestInfo } from '@playwright/test';
import { createChallenge, pbkdf2, verifySolution } from 'altcha/lib';

// The contact service (GET /contact/challenge, POST /contact) is mocked: the
// challenge is a real ALTCHA challenge (PBKDF2/SHA-256, low cost) created here,
// so the widget solves it in its worker and the test can verify the payload.

const SIG = 'test-signature-secret';
const KEY = 'test-key-secret';
const LANGUAGES = [
	{ tag: 'en', prefix: '', title: 'Contact', sent: 'Thank you, your message has arrived.', send: 'Send message' },
	{ tag: 'de', prefix: '/de', title: 'Kontakt', sent: 'Danke, deine Nachricht ist angekommen.', send: 'Nachricht senden' }
];
const RESULTS = ['sent', 'failed', 'limit', 'invalid'] as const;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

/** Console errors, page errors and CSP violations while a test runs. */
async function watch(page: Page): Promise<string[]> {
	const problems: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') problems.push(msg.text());
	});
	page.on('pageerror', (err) => problems.push(err.message));
	await page.addInitScript(() => {
		document.addEventListener('securitypolicyviolation', (e) => {
			console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
		});
	});
	return problems;
}

async function mockChallenge(page: Page): Promise<void> {
	await page.route(
		(url) => url.pathname === '/contact/challenge',
		async (route) => {
			const challenge = await createChallenge({
				algorithm: 'PBKDF2/SHA-256',
				deriveKey: pbkdf2.deriveKey,
				cost: 1000,
				counter: 40,
				keyLength: 32,
				hmacSignatureSecret: SIG,
				hmacKeySignatureSecret: KEY,
				expiresAt: new Date(Date.now() + 10 * 60_000)
			});
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(challenge) });
		}
	);
}

/** POST /contact answers 303 to the result page, like the contact service. */
async function mockSubmit(page: Page, prefix: string, result: (typeof RESULTS)[number] | 'abort' | 429): Promise<Request[]> {
	const requests: Request[] = [];
	await page.route(
		(url) => url.pathname === '/contact',
		async (route, request) => {
			requests.push(request);
			if (result === 'abort') return route.abort('failed');
			if (result === 429) return route.fulfill({ status: 429, body: 'too many requests' });
			const origin = new URL(request.url()).origin;
			return route.fulfill({ status: 303, headers: { location: `${origin}${prefix}/contact/${result}/` } });
		}
	);
	return requests;
}

function needsJs(info: TestInfo): void {
	test.skip(info.project.name === 'no-js', 'needs JavaScript');
}

async function fillForm(page: Page, message = 'Hello, a question about section 5.3.'): Promise<void> {
	await page.locator('#c-name').fill('Kim');
	await page.locator('#c-email').fill('kim@example.org');
	await page.locator('#c-message').fill(message);
	await page.locator('#c-privacy').check();
}

async function waitVerified(page: Page): Promise<void> {
	await expect(page.locator('altcha-widget .altcha')).toHaveAttribute('data-state', 'verified', { timeout: 20_000 });
}

for (const lang of LANGUAGES) {
	test.describe(lang.tag, () => {
		test('contact page shows the form with JavaScript and the e-mail box without', async ({ page }, info) => {
			const problems = await watch(page);
			await mockChallenge(page);
			await page.goto(`${lang.prefix}/contact/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.title);
			await expect(page.locator('meta[name=robots]')).toHaveCount(0);
			await expect(page.locator('aside a[href="mailto:contact@home-mandate.org"]')).toBeVisible();
			const form = page.locator('form[data-contact-form]');
			const noJs = page.locator('.no-js-only');
			if (info.project.name === 'no-js') {
				await expect(form).toBeHidden();
				await expect(noJs).toBeVisible();
				await expect(noJs.locator('a[href="mailto:contact@home-mandate.org"]')).toBeVisible();
			} else {
				await expect(form).toBeVisible();
				await expect(noJs).toBeHidden();
				await expect(form).toHaveAttribute('action', '/contact');
				await expect(form).toHaveAttribute('method', 'post');
				await expect(form.locator('input[name=lang]')).toHaveValue(lang.tag);
				await expect(page.locator('altcha-widget')).toBeVisible();
			}
			expect(problems).toEqual([]);
		});

		test('contact page has no accessibility violations', async ({ page }, info) => {
			needsJs(info);
			await mockChallenge(page);
			await page.goto(`${lang.prefix}/contact/`);
			await expect(page.locator('altcha-widget .altcha')).toBeVisible();
			const empty = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
			expect(empty.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
			await page.getByRole('button', { name: lang.send }).click();
			await expect(page.locator('[data-banner=summary]')).toBeVisible();
			const errors = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
			expect(errors.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
		});

		test('sends the form and lands on the thank-you page', async ({ page, baseURL }, info) => {
			needsJs(info);
			const problems = await watch(page);
			await mockChallenge(page);
			const requests = await mockSubmit(page, lang.prefix, 'sent');
			await page.goto(`${lang.prefix}/contact/`);
			await fillForm(page);
			await waitVerified(page);
			await page.getByRole('button', { name: lang.send }).click();
			await expect(page).toHaveURL(`${baseURL}${lang.prefix}/contact/sent/`);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(lang.sent);

			expect(requests).toHaveLength(1);
			const request = requests[0] as Request;
			expect(request.method()).toBe('POST');
			expect(await request.headerValue('content-type')).toMatch(/^application\/x-www-form-urlencoded/);
			const body = new URLSearchParams(request.postData() ?? '');
			expect([...body.keys()].sort()).toEqual(['altcha', 'email', 'lang', 'message', 'name', 'privacy', 'website']);
			expect(body.get('name')).toBe('Kim');
			expect(body.get('email')).toBe('kim@example.org');
			expect(body.get('message')).toBe('Hello, a question about section 5.3.');
			expect(body.get('privacy')).toBe('yes');
			expect(body.get('lang')).toBe(lang.tag);
			expect(body.get('website')).toBe('');
			const payload = JSON.parse(Buffer.from(body.get('altcha') ?? '', 'base64').toString('utf8'));
			expect(payload.challenge.parameters.algorithm).toBe('PBKDF2/SHA-256');
			const verified = await verifySolution({
				challenge: payload.challenge,
				solution: payload.solution,
				deriveKey: pbkdf2.deriveKey,
				hmacSignatureSecret: SIG,
				hmacKeySignatureSecret: KEY
			});
			expect(verified.verified).toBe(true);
			expect(problems).toEqual([]);
		});

		for (const result of ['failed', 'limit', 'invalid'] as const) {
			test(`shows the ${result} banner and keeps the text`, async ({ page }, info) => {
				needsJs(info);
				const problems = await watch(page);
				await mockChallenge(page);
				await mockSubmit(page, lang.prefix, result);
				await page.goto(`${lang.prefix}/contact/`);
				await fillForm(page);
				await waitVerified(page);
				await page.getByRole('button', { name: lang.send }).click();
				const banner = page.locator(`[data-banner=${result}]`);
				await expect(banner).toBeVisible();
				await expect(banner).toBeFocused();
				await expect(page).toHaveURL(new RegExp(`${lang.prefix}/contact/$`));
				await expect(page.locator('#c-message')).toHaveValue('Hello, a question about section 5.3.');
				await expect(page.locator('#c-email')).toHaveValue('kim@example.org');
				await expect(page.locator('#c-message')).toBeEnabled();
				await expect(banner.locator('a[href^="mailto:"]')).toHaveCount(result === 'failed' ? 1 : 0);
				expect(problems.filter((p) => !p.includes('/contact'))).toEqual([]);
			});
		}

		test('result pages are not indexed and send nothing on reload', async ({ page }) => {
			const posts: string[] = [];
			page.on('request', (r) => {
				if (r.method() === 'POST') posts.push(r.url());
			});
			for (const result of RESULTS) {
				await page.goto(`${lang.prefix}/contact/${result}/`);
				await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
				await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
				await page.reload();
			}
			await page.goto(`${lang.prefix}/contact/failed/`);
			await expect(page.locator('main a[href="mailto:contact@home-mandate.org"]')).toBeVisible();
			await expect(page.locator(`main a[href="${lang.prefix}/contact/"]`)).toBeVisible();
			expect(posts).toEqual([]);
		});

		test('result pages have no accessibility violations', async ({ page }, info) => {
			needsJs(info);
			for (const result of RESULTS) {
				await page.goto(`${lang.prefix}/contact/${result}/`);
				const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
				expect(violations.map((v) => `${result} ${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
			}
		});
	});
}

test('errors appear after the first submit, with summary and focus on the first invalid field', async ({ page }, info) => {
	needsJs(info);
	await mockChallenge(page);
	await page.goto('/contact/');
	await page.locator('#c-email').fill('kim@example');
	await expect(page.locator('#c-email-err')).toBeHidden();
	await expect(page.locator('#c-email')).not.toHaveAttribute('aria-invalid', 'true');

	await page.getByRole('button', { name: 'Send message' }).click();
	const summary = page.locator('[data-banner=summary]');
	await expect(summary).toBeVisible();
	await expect(summary.locator('li')).toHaveCount(3);
	await expect(page.locator('#c-email')).toBeFocused();
	await expect(page.locator('#c-email')).toHaveAttribute('aria-invalid', 'true');
	await expect(page.locator('#c-email')).toHaveAttribute('aria-describedby', 'c-email-err');
	await expect(page.locator('#c-email-err')).toHaveText(/doesn’t look like an e-mail address/);
	await expect(page.locator('#c-message')).toHaveAttribute('aria-invalid', 'true');
	await expect(page.locator('#c-message-err')).toHaveText('Please write a message.');
	await expect(page.locator('#c-privacy')).toHaveAttribute('aria-invalid', 'true');
	await expect(page.locator('#c-name')).not.toHaveAttribute('aria-invalid', 'true');

	// Fixing a field updates its error at once.
	await page.locator('#c-email').fill('kim@example.org');
	await expect(page.locator('#c-email-err')).toBeHidden();
	await expect(page.locator('#c-email')).not.toHaveAttribute('aria-invalid', 'true');
	await summary.getByRole('link', { name: 'Please write a message.' }).click();
	await expect(page.locator('#c-message')).toBeFocused();
});

test('submitting before the check is done asks to wait', async ({ page }, info) => {
	needsJs(info);
	await page.route(
		(url) => url.pathname === '/contact/challenge',
		() => {
			// Never answers: the widget stays in "verifying".
		}
	);
	await page.goto('/contact/');
	await fillForm(page);
	await page.getByRole('button', { name: 'Send message' }).click();
	await expect(page.locator('#c-altcha-err')).toHaveText('Please wait for the check to finish.');
	await expect(page.locator('altcha-widget input[type=checkbox]')).toBeFocused();
});

test('a network error and a 429 from the proxy show banners', async ({ page }, info) => {
	needsJs(info);
	await mockChallenge(page);
	const requests = await mockSubmit(page, '', 'abort');
	await page.goto('/contact/');
	await fillForm(page);
	await waitVerified(page);
	await page.getByRole('button', { name: 'Send message' }).click();
	await expect(page.locator('[data-banner=failed]')).toBeVisible();
	expect(requests).toHaveLength(1);

	await page.unroute((url) => url.pathname === '/contact');
	await mockSubmit(page, '', 429);
	await waitVerified(page);
	await page.getByRole('button', { name: 'Send message' }).click();
	await expect(page.locator('[data-banner=limit]')).toBeVisible();
	await expect(page.locator('[data-banner=failed]')).toBeHidden();
});

test('sending locks the form and shows the sending state', async ({ page }, info) => {
	needsJs(info);
	await mockChallenge(page);
	let release: () => void = () => {};
	const held = new Promise<void>((resolve) => (release = resolve));
	await page.route(
		(url) => url.pathname === '/contact',
		async (route) => {
			await held;
			await route.fulfill({ status: 303, headers: { location: `${new URL(route.request().url()).origin}/contact/failed/` } });
		}
	);
	await page.goto('/contact/');
	await fillForm(page);
	await waitVerified(page);
	await page.getByRole('button', { name: 'Send message' }).click();
	const form = page.locator('form[data-contact-form]');
	await expect(form).toHaveAttribute('aria-busy', 'true');
	await expect(page.locator('button[type=submit]')).toHaveText('Sending …');
	await expect(page.locator('button[type=submit]')).toBeDisabled();
	await expect(page.locator('#c-message')).toBeDisabled();
	await expect(form.locator('.spinner')).toBeVisible();
	release();
	await expect(form).toHaveAttribute('aria-busy', 'false');
	await expect(page.locator('button[type=submit]')).toHaveText('Send message');
});

test('the honeypot cannot be reached by keyboard or screen reader', async ({ page }, info) => {
	needsJs(info);
	await mockChallenge(page);
	await page.goto('/contact/');
	const honeypot = page.locator('input[name=website]');
	await expect(honeypot).toHaveAttribute('tabindex', '-1');
	await expect(honeypot).toHaveAttribute('autocomplete', 'off');
	await expect(page.locator('.hp')).toHaveAttribute('aria-hidden', 'true');
	const box = await honeypot.boundingBox();
	expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(0);
	await page.locator('#c-name').focus();
	const visited: string[] = [];
	for (let i = 0; i < 12; i++) {
		await page.keyboard.press('Tab');
		visited.push(await page.evaluate(() => document.activeElement?.getAttribute('name') ?? document.activeElement?.tagName ?? ''));
	}
	expect(visited).not.toContain('website');
	const snapshot = await page.locator('form[data-contact-form]').ariaSnapshot();
	expect(snapshot).not.toMatch(/website|Leave this field empty/i);
});

test('the character counter changes colour from 4500 and above 5000', async ({ page }, info) => {
	needsJs(info);
	await mockChallenge(page);
	await page.goto('/contact/');
	const counter = page.locator('#c-message-count');
	await expect(counter).toHaveText('0 / 5,000');
	const colour = (name: string) =>
		page.evaluate((n) => {
			const probe = document.createElement('span');
			probe.style.setProperty('color', `var(${n})`);
			document.body.append(probe);
			const value = getComputedStyle(probe).color;
			probe.remove();
			return value;
		}, name);
	await page.locator('#c-message').fill('a'.repeat(4500));
	await expect(counter).toHaveText('4,500 / 5,000');
	await expect(counter).toHaveCSS('color', await colour('--ms-ask-fg'));
	await page.locator('#c-message').fill('a'.repeat(5012));
	await expect(counter).toHaveCSS('color', await colour('--ms-deny-fg'));
	await expect(page.locator('#c-message-err')).toHaveText('The message is 12 characters too long.');
	await page.locator('#c-message').fill('a'.repeat(100));
	await expect(counter).toHaveCSS('color', await colour('--ms-text-muted'));
	await expect(page.locator('#c-message-err')).toBeHidden();
});

test('the counter and the length error count the message without outer white space', async ({ page }, info) => {
	needsJs(info);
	await mockChallenge(page);
	await page.goto('/contact/');
	const counter = page.locator('#c-message-count');
	await page.locator('#c-message').fill(`  ${'a'.repeat(10)}\n\n  `);
	await expect(counter).toHaveText('10 / 5,000');
	await page.locator('#c-message').fill(`${'a'.repeat(5000)}${' '.repeat(30)}`);
	await expect(counter).toHaveText('5,000 / 5,000');
	await expect(page.locator('#c-message-err')).toBeHidden();
	await page.locator('#c-message').fill(`${' '.repeat(30)}${'a'.repeat(5003)}${' '.repeat(30)}`);
	await expect(counter).toHaveText('5,003 / 5,000');
	await expect(page.locator('#c-message-err')).toHaveText('The message is 3 characters too long.');
});

test('the contact form stores nothing in the browser', async ({ page, context }, info) => {
	needsJs(info);
	await mockChallenge(page);
	await page.goto('/contact/');
	await page.locator('#c-email').focus();
	await waitVerified(page);
	expect(await context.cookies()).toEqual([]);
	expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});
