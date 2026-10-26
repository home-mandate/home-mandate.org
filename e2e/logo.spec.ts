import { expect, test, type Locator, type Page } from '@playwright/test';

// The logo (house with key): a light and a dark image, of which the theme tokens
// show exactly one, by the system setting and by the theme switch.

async function shown(images: Locator): Promise<string[]> {
	const sources: string[] = [];
	for (const image of await images.all()) {
		if (await image.isVisible()) sources.push((await image.getAttribute('src')) ?? '');
	}
	return sources;
}

async function force(page: Page, theme: 'light' | 'dark') {
	await page.evaluate((t) => document.documentElement.setAttribute('data-ms-theme', t), theme);
}

for (const scheme of ['light', 'dark'] as const) {
	test(`header and footer show only the ${scheme} logo in the ${scheme} system scheme`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto('/');
		expect(await shown(page.locator('header .home img'))).toEqual([`/logo/lockup-${scheme}.svg`]);
		expect(await shown(page.locator('footer img'))).toEqual([`/logo/lockup-tagline-${scheme}.svg`]);
	});
}

test('the theme switch overrides the system scheme for the logo', async ({ page }, info) => {
	test.skip(info.project.name === 'no-js', 'the theme switch needs JavaScript');
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	await force(page, 'dark');
	expect(await shown(page.locator('header .home img'))).toEqual(['/logo/lockup-dark.svg']);
	await page.emulateMedia({ colorScheme: 'dark' });
	await force(page, 'light');
	expect(await shown(page.locator('header .home img'))).toEqual(['/logo/lockup-light.svg']);
});

test('the logo keeps its aspect ratio and the footer logo names the tagline', async ({ page }) => {
	await page.goto('/');
	const header = (await page.locator('header .home img:visible').boundingBox())!;
	expect(header.width / header.height).toBeCloseTo(1758 / 423.06, 1);
	await expect(page.locator('footer img').first()).toHaveAttribute('alt', 'Home-Mandate – AI is coming home. Decide what it may do.');
});

for (const prefix of ['', '/de']) {
	test(`the header fits into 375 px (${prefix || '/en'})`, async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto(`${prefix}/`);
		const header = page.locator('header.header');
		expect(await header.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
		await expect(page.locator('header .home img:visible')).toBeInViewport({ ratio: 1 });
	});
}

test('favicons and app icons are served', async ({ request }) => {
	for (const [path, type] of [
		['/favicon.svg', 'image/svg+xml'],
		['/icons/icon-180.png', 'image/png'],
		['/logo/lockup-light.svg', 'image/svg+xml'],
		['/logo/lockup-tagline-dark.svg', 'image/svg+xml']
	]) {
		const response = await request.get(path);
		expect(response.status(), path).toBe(200);
		expect(response.headers()['content-type'], path).toContain(type);
	}
	// vite preview sends .ico without a type; check the file itself (ICO header, 3 images).
	const ico = await request.get('/favicon.ico');
	expect(ico.status()).toBe(200);
	expect([...(await ico.body()).subarray(0, 6)]).toEqual([0, 0, 1, 0, 3, 0]);
});
