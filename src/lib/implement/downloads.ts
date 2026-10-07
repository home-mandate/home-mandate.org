// Files of the imported specification that /implement/ offers for download.
// Paths are where the site serves them (scripts/import-spec.ts); size and
// SHA-256 are computed from those served bytes at build time.

export const DOWNLOADS = [
	{ id: 'mandate', path: 'mandate/v0/mandate.schema.json', file: 'mandate.schema.json' },
	{ id: 'vocabulary', path: 'vocabulary/v0.json', file: 'vocabulary-v0.json' },
	{ id: 'audit', path: 'audit/v0/audit.schema.json', file: 'audit.schema.json' }
] as const;

export type DownloadId = (typeof DOWNLOADS)[number]['id'];

export interface Download {
	id: DownloadId;
	/** Site path with leading slash, e.g. /vocabulary/v0.json */
	href: string;
	/** Suggested file name for the download attribute. */
	file: string;
	bytes: number;
	sha256: string;
}

const SHA256 = /^[0-9a-f]{64}$/;

/** 3f9a1c7e…c21e: the first eight and the last four hex digits. */
export function shortHash(hash: string): string {
	if (!SHA256.test(hash)) throw new Error(`not a SHA-256 hex digest: ${hash}`);
	return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

/** Size in kilobytes (1 KB = 1024 bytes), one decimal below 10 KB, formatted for the locale. */
export function kilobytes(bytes: number, locale: string): string {
	if (!Number.isFinite(bytes) || bytes < 0) throw new Error(`invalid size ${bytes}`);
	const kb = bytes / 1024;
	const digits = kb < 10 ? 1 : 0;
	return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(kb);
}
