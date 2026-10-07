// Parameters are integers in the unit of the vocabulary (SPEC-v0 section 4.5): a
// temperature in 0.01 degree Celsius. People type 21.5; the mandate says 2150. The
// conversion works on the decimal text, so that no binary fraction creeps in.

/** Decimal places a value in displayed units may have: 2 for scale 100, 0 for scale 1. */
export function decimalPlaces(scale: number): number {
	return Math.round(Math.log10(scale));
}

/** Integer in the vocabulary unit, NaN if the text has more decimals than the unit allows. */
export function toUnit(text: string, scale: number): number {
	const match = /^\s*([+-]?)(\d*)(?:[.,](\d*))?\s*$/.exec(text);
	if (!match || (match[2] === '' && (match[3] ?? '') === '')) return NaN;
	const digits = decimalPlaces(scale);
	const fraction = (match[3] ?? '').replace(/0+$/, '');
	if (fraction.length > digits) return NaN;
	const value = Number(`${match[2] || '0'}${fraction.padEnd(digits, '0')}`);
	return match[1] === '-' ? -value : value;
}

/** The value in displayed units as text: 2150 with scale 100 → "21.5". */
export function fromUnit(value: number, scale: number): string {
	if (scale === 1) return String(value);
	const digits = decimalPlaces(scale);
	const sign = value < 0 ? '-' : '';
	const text = String(Math.abs(value)).padStart(digits + 1, '0');
	const whole = text.slice(0, -digits);
	const fraction = text.slice(-digits).replace(/0+$/, '');
	return `${sign}${whole}${fraction ? `.${fraction}` : ''}`;
}

/** The displayed value in the page's language (decimal comma in German). */
export function formatUnit(value: number, scale: number, locale: string): string {
	const text = fromUnit(value, scale);
	const decimal = new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value ?? '.';
	return text.replace('.', decimal);
}
