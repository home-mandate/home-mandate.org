// Tags of the specification: a release is vX.Y.Z, a pre-release adds -alpha.N or -rc.N.
// Shared by the status band, the version picker and the reader of /spec/v0/.

const VERSION_TAG = /^v(\d+)\.(\d+)\.\d+(-[a-z]+\.\d+)?$/;

/** A released version (v0.2.0), not a pre-release (v0.2.0-rc.4). */
export function isRelease(tag: string): boolean {
	const match = VERSION_TAG.exec(tag);
	return match !== null && match[3] === undefined;
}

/** v0.2.0 and v0.2.0-rc.4 → v0.2 */
export function minorOf(tag: string): string {
	const match = VERSION_TAG.exec(tag);
	if (!match) throw new Error(`${tag} is not a version tag`);
	return `v${match[1]}.${match[2]}`;
}

/**
 * The minor version the site names in its status band: that of the latest release among
 * the imported tags (oldest first), or of the latest tag while nothing is released yet.
 */
export function statusVersion(tags: readonly string[]): string {
	const latest = tags.filter(isRelease).at(-1) ?? tags.at(-1);
	if (latest === undefined) throw new Error('no version imported');
	return minorOf(latest);
}
