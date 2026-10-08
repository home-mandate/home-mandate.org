// The five building blocks on /how-it-works/. "spec" is the term as SPEC-v0
// section 2 (Terminology) defines it; test/how.test.ts checks that it does.
import type { IconName } from '$lib/icons';

export const BLOCKS: { id: string; icon: IconName; spec: string }[] = [
	{ id: 'household', icon: 'home', spec: 'principal' },
	{ id: 'agent', icon: 'agent', spec: 'agent' },
	{ id: 'device', icon: 'device', spec: 'resource' },
	{ id: 'action', icon: 'action', spec: 'action' },
	{ id: 'decision', icon: 'decision', spec: 'decision' }
];
