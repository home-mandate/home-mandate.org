import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['test/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['scripts/lib/**/*.ts', 'src/lib/**/*.ts', 'src/client/lib/theme.ts', 'src/client/playground/*.ts'],
			exclude: ['src/lib/paraglide/**', 'src/lib/generated/**'],
			thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 }
		}
	}
});
