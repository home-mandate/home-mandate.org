// Line numbers in the JSON text: where a value (by JSON pointer) starts, and where a
// syntax error is. Only for messages; validity is decided by parseMandate.

/** Line (1-based) of a character offset. */
export function lineAt(text: string, offset: number): number {
	let line = 1;
	for (let i = 0; i < Math.min(offset, text.length); i += 1) if (text.charCodeAt(i) === 10) line += 1;
	return line;
}

/** Line of the value at a JSON pointer, or of its nearest ancestor that exists. */
export function lineOfPointer(text: string, pointer: string): number | undefined {
	const target = pointer === '' || pointer === '/' ? [] : pointer.slice(1).split('/').map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
	const found = new Map<string, number>();
	try {
		walk(text, found);
	} catch {
		// A text that does not parse has no pointers; fall through with what was found.
	}
	for (let depth = target.length; depth >= 0; depth -= 1) {
		const offset = found.get(target.slice(0, depth).join('/'));
		if (offset !== undefined) return lineAt(text, offset);
	}
	return undefined;
}

const DUPLICATE = '#duplicate';

/** Records the start offset of every value by its path ("rules/0/id"). */
function walk(text: string, found: Map<string, number>): void {
	let pos = 0;
	const space = (): void => {
		while (pos < text.length && ' \t\r\n'.includes(text.charAt(pos))) pos += 1;
	};
	const string = (): string => {
		const start = pos;
		pos += 1;
		while (pos < text.length && text.charAt(pos) !== '"') pos += text.charAt(pos) === '\\' ? 2 : 1;
		pos += 1;
		return JSON.parse(text.slice(start, pos)) as string;
	};
	const value = (path: string[]): void => {
		space();
		found.set(path.join('/'), pos);
		const c = text.charAt(pos);
		if (c === '{') {
			pos += 1;
			space();
			if (text.charAt(pos) === '}') {
				pos += 1;
				return;
			}
			const keys = new Set<string>();
			for (;;) {
				space();
				const keyAt = pos;
				const key = string();
				if (keys.has(key) && !found.has(DUPLICATE)) found.set(DUPLICATE, keyAt);
				keys.add(key);
				space();
				if (text.charAt(pos) !== ':') throw new Error('expected :');
				pos += 1;
				value([...path, key]);
				space();
				const next = text.charAt(pos);
				pos += 1;
				if (next === '}') return;
				if (next !== ',') throw new Error('expected , or }');
			}
		}
		if (c === '[') {
			pos += 1;
			space();
			if (text.charAt(pos) === ']') {
				pos += 1;
				return;
			}
			for (let i = 0; ; i += 1) {
				value([...path, String(i)]);
				space();
				const next = text.charAt(pos);
				pos += 1;
				if (next === ']') return;
				if (next !== ',') throw new Error('expected , or ]');
			}
		}
		if (c === '"') {
			string();
			return;
		}
		const literal = /^(?:true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(pos));
		if (!literal) throw new Error('unexpected token');
		pos += literal[0].length;
	};
	value([]);
}

/** Line of a syntax error, from the message of the browser's JSON.parse. */
export function syntaxErrorLine(text: string): number | undefined {
	try {
		JSON.parse(text);
		return undefined;
	} catch (e) {
		const message = e instanceof Error ? e.message : '';
		const line = /line (\d+)/.exec(message);
		if (line) return Number(line[1]);
		const position = /position (\d+)/.exec(message);
		if (position) return lineAt(text, Number(position[1]));
		return undefined;
	}
}

/** Line of the first key that repeats a key of the same object. */
export function duplicateKeyLine(text: string): number | undefined {
	const found = new Map<string, number>();
	try {
		walk(text, found);
	} catch {
		return undefined;
	}
	const offset = found.get(DUPLICATE);
	return offset === undefined ? undefined : lineAt(text, offset);
}
