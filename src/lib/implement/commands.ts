// Commands for installing and running the conformance test tool, as the
// specification repository documents them (README "Testing an implementation",
// SPEC-v0 section 10.4), pinned to the imported release.

export type CommandId = 'install' | 'exec' | 'http';

export interface Command {
	id: CommandId;
	command: string;
}

/** Go module path of a GitHub repository URL: https://github.com/a/b -> github.com/a/b */
export function modulePath(repository: string): string {
	const match = /^https:\/\/(github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(\.git)?\/?$/.exec(repository);
	if (!match?.[1]) throw new Error(`not a GitHub repository URL: ${repository}`);
	return match[1];
}

export function conformanceCommands(repository: string, tag: string): Command[] {
	if (!/^v[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$/.test(tag)) throw new Error(`invalid release tag ${tag}`);
	return [
		{ id: 'install', command: `go install ${modulePath(repository)}/cmd/mandate-conformance@${tag}` },
		{ id: 'exec', command: 'mandate-conformance -report report.json -exec ./your-harness' },
		{ id: 'http', command: 'mandate-conformance -report report.json -authzen https://pdp.test -control https://pdp.test/test/state' }
	];
}
