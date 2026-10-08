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

/** Reading position in the text, and the start offsets found so far by path. */
interface Cursor {
	readonly text: string;
	pos: number;
	readonly found: Map<string, number>;
}

function skipSpace(c: Cursor): void {
	while (c.pos < c.text.length && ' \t\r\n'.includes(c.text.charAt(c.pos))) c.pos += 1;
}

function readString(c: Cursor): string {
	const start = c.pos;
	c.pos += 1;
	while (c.pos < c.text.length && c.text.charAt(c.pos) !== '"') c.pos += c.text.charAt(c.pos) === '\\' ? 2 : 1;
	c.pos += 1;
	return JSON.parse(c.text.slice(start, c.pos)) as string;
}

/** After a member or element: true at the closing bracket, on to the next one at a comma. */
function closes(c: Cursor, close: '}' | ']'): boolean {
	skipSpace(c);
	const next = c.text.charAt(c.pos);
	c.pos += 1;
	if (next === close) return true;
	if (next !== ',') throw new Error(`expected , or ${close}`);
	return false;
}

/** True (and past it) if the container is empty: the closing bracket follows at once. */
function empty(c: Cursor, close: '}' | ']'): boolean {
	c.pos += 1;
	skipSpace(c);
	if (c.text.charAt(c.pos) !== close) return false;
	c.pos += 1;
	return true;
}

function readObject(c: Cursor, path: string[]): void {
	if (empty(c, '}')) return;
	const keys = new Set<string>();
	do {
		skipSpace(c);
		const keyAt = c.pos;
		const key = readString(c);
		if (keys.has(key) && !c.found.has(DUPLICATE)) c.found.set(DUPLICATE, keyAt);
		keys.add(key);
		skipSpace(c);
		if (c.text.charAt(c.pos) !== ':') throw new Error('expected :');
		c.pos += 1;
		readValue(c, [...path, key]);
	} while (!closes(c, '}'));
}

function readArray(c: Cursor, path: string[]): void {
	if (empty(c, ']')) return;
	let i = 0;
	do {
		readValue(c, [...path, String(i)]);
		i += 1;
	} while (!closes(c, ']'));
}

function readValue(c: Cursor, path: string[]): void {
	skipSpace(c);
	c.found.set(path.join('/'), c.pos);
	const first = c.text.charAt(c.pos);
	if (first === '{') return readObject(c, path);
	if (first === '[') return readArray(c, path);
	if (first === '"') {
		readString(c);
		return;
	}
	const literal = /^(?:true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(c.text.slice(c.pos));
	if (!literal) throw new Error('unexpected token');
	c.pos += literal[0].length;
}

/** Records the start offset of every value by its path ("rules/0/id"). */
function walk(text: string, found: Map<string, number>): void {
	readValue({ text, pos: 0, found }, []);
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
