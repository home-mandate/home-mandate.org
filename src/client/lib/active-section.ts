// Which section of a long text is being read: the last heading whose top has
// passed the reading line. Before the first heading, the first one counts.

/** tops: positions of the headings in document order, relative to the viewport. */
export function activeIndex(tops: readonly number[], line: number): number {
	let active = 0;
	for (let i = 0; i < tops.length; i++) {
		if ((tops[i] ?? Infinity) > line) break;
		active = i;
	}
	return active;
}
