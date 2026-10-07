import { defineConfig, devices } from '@playwright/test';

// Runs against the static build (pnpm build first), served by vite preview.
// PREVIEW_PORT lets several checkouts run their tests at the same time.
const port = Number(process.env.PREVIEW_PORT ?? 4173);

export default defineConfig({
	testDir: './e2e',
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure', reducedMotion: 'reduce' },
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'no-js', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } }
	],
	webServer: {
		command: `pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: `http://127.0.0.1:${port}/`,
		reuseExistingServer: !process.env.CI
	}
});
