import { describe, expect, it } from 'vitest';
import { spec } from '../src/lib/generated/spec';
import { isRelease, minorOf, statusVersion } from '../src/lib/spec/version';

describe('spec versions', () => {
	it('tells a release from a pre-release by its tag', () => {
		expect(isRelease('v0.2.0')).toBe(true);
		expect(isRelease('v0.1.1')).toBe(true);
		expect(isRelease('v1.10.3')).toBe(true);
		expect(isRelease('v0.2.0-rc.4')).toBe(false);
		expect(isRelease('v0.1.0-alpha.1')).toBe(false);
		expect(isRelease('0.2.0')).toBe(false);
		expect(isRelease('')).toBe(false);
	});

	it('names the minor version of a tag', () => {
		expect(minorOf('v0.2.0')).toBe('v0.2');
		expect(minorOf('v0.2.0-rc.4')).toBe('v0.2');
		expect(minorOf('v1.10.3')).toBe('v1.10');
		expect(() => minorOf('latest')).toThrow(/not a version tag/);
	});

	it('shows the minor version of the latest release, not of a later pre-release', () => {
		expect(statusVersion(['v0.1.0-rc.5', 'v0.1.0', 'v0.1.1', 'v0.2.0-rc.1'])).toBe('v0.1');
		expect(statusVersion(['v0.1.1', 'v0.2.0-rc.4', 'v0.2.0'])).toBe('v0.2');
		expect(statusVersion(['v0.1.0-alpha.1'])).toBe('v0.1');
		expect(() => statusVersion([])).toThrow(/no version/);
	});

	it('shows the minor version of the imported latest release', () => {
		expect(statusVersion(spec.versions.map((v) => v.tag))).toBe(minorOf(spec.latest.tag));
	});
});
