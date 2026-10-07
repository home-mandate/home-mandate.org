// Data model summary for /implement/, derived from the mandate JSON Schema at
// build time: field names in schema order, a short type and whether the field
// is optional. Nothing here is written by hand, so the boxes cannot drift from
// the normative schema.

export interface Field {
	name: string;
	type: string;
	optional: boolean;
}

type Node = Record<string, unknown>;

const REF = '#/$defs/';

function isNode(value: unknown): value is Node {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The definition a local $ref points to, with its name. */
export function resolve(ref: string, root: Node): { name: string; node: Node } {
	if (!ref.startsWith(REF)) throw new Error(`unsupported $ref ${ref}`);
	const name = ref.slice(REF.length);
	const node = isNode(root.$defs) ? root.$defs[name] : undefined;
	if (!isNode(node)) throw new Error(`$ref ${ref} not found`);
	return { name, node };
}

/** rule -> Rule, date_time -> DateTime */
export function typeName(defName: string): string {
	return defName
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
}

function isObject(node: Node): boolean {
	return node.type === 'object' || isNode(node.properties);
}

/** A short, readable type for one schema node. */
export function typeOf(node: Node, root: Node): string {
	if ('const' in node) return JSON.stringify(node.const);
	if (Array.isArray(node.enum)) return node.enum.map((v) => String(v)).join('|');
	if (typeof node.$ref === 'string') {
		const { name, node: target } = resolve(node.$ref, root);
		if (isObject(target)) return typeName(name);
		if (typeof target.format === 'string') return target.format;
		return name;
	}
	if (node.type === 'array') return `${isNode(node.items) ? typeOf(node.items, root) : 'unknown'}[]`;
	if (isObject(node)) {
		const keys = isNode(node.properties) ? Object.keys(node.properties) : [];
		return keys.length > 0 ? `{${keys.join(', ')}}` : 'object';
	}
	if (typeof node.type === 'string') return node.type;
	throw new Error(`no type for ${JSON.stringify(node).slice(0, 80)}`);
}

/** Fields of an object schema (or of the definition it refers to), in schema order. */
export function fieldsOf(node: Node, root: Node): Field[] {
	const target = typeof node.$ref === 'string' ? resolve(node.$ref, root).node : node;
	if (!isNode(target.properties)) throw new Error('schema node has no properties');
	const required = new Set(Array.isArray(target.required) ? (target.required as string[]) : []);
	return Object.entries(target.properties).map(([name, child]) => {
		if (!isNode(child)) throw new Error(`property ${name} is not a schema`);
		return { name, type: typeOf(child, root), optional: !required.has(name) };
	});
}

/** "0…200" for an array schema with maxItems 200; "n" stands for no upper bound. */
export function cardinality(node: Node): { min: number; max: string } {
	const min = typeof node.minItems === 'number' ? node.minItems : 0;
	const max = typeof node.maxItems === 'number' ? String(node.maxItems) : 'n';
	return { min, max };
}

export interface DataModel {
	mandate: Field[];
	rule: Field[];
	rules: { min: number; max: string };
}

/** Mandate and rule fields plus how many rules a mandate holds. */
export function dataModel(schema: Node): DataModel {
	const props = isNode(schema.properties) ? schema.properties : {};
	const rules = props.rules;
	if (!isNode(rules) || !isNode(rules.items)) throw new Error('mandate schema has no rules array');
	return { mandate: fieldsOf(schema, schema), rule: fieldsOf(rules.items, schema), rules: cardinality(rules) };
}
