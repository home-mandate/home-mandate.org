import { describe, expect, it } from 'vitest';
import { describeMandate, describeRule, resourcePhrase } from '../src/client/playground/describe.ts';
import { readRule, rulesOf, type RuleView } from '../src/client/playground/model.ts';
import { actionLabel, capitalize, joinOr, tx, unitLabel } from '../src/client/playground/texts.ts';
import { exampleDoc, texts } from './playground-fixtures.ts';

const en = { texts: texts('en'), locale: 'en' };
const de = { texts: texts('de'), locale: 'de' };

describe('plain-language renderer', () => {
	it('describes the voice assistant example in English', () => {
		const rules = describeMandate(en, 'Sprachassistent', rulesOf(exampleDoc('voice-assistant')));
		expect(rules.map((r) => r.sentences.join(' '))).toEqual([
			'Any device: Sprachassistent may read.',
			'Lights: Sprachassistent may turn on, turn off or set.',
			'Heating: Sprachassistent may set temperature.',
			'Locks: Sprachassistent may unlock or open, but only after confirmation by user-1.',
			'Cameras: Sprachassistent may do nothing.',
			'Alarm: Sprachassistent may not disarm.'
		]);
		expect(rules.map((r) => [r.id, r.decision])[3]).toEqual(['r-locks', 'ask']);
	});

	it('describes the voice assistant example in German', () => {
		const rules = describeMandate(de, 'Sprachassistent', rulesOf(exampleDoc('voice-assistant')));
		expect(rules.map((r) => r.sentences.join(' '))).toEqual([
			'Jedes Gerät: Sprachassistent darf lesen.',
			'Licht: Sprachassistent darf einschalten, ausschalten oder einstellen.',
			'Heizung: Sprachassistent darf Temperatur einstellen.',
			'Schlösser: Sprachassistent darf entriegeln oder öffnen, aber nur nach Bestätigung durch user-1.',
			'Kameras: Sprachassistent darf nichts tun.',
			'Alarmanlage: Sprachassistent darf nicht unscharf schalten.'
		]);
	});

	it('describes devices by id, areas, days and time windows', () => {
		const energy = describeMandate(en, 'Energie-Agent', rulesOf(exampleDoc('energy-agent')));
		expect(energy[2]?.sentences).toEqual([
			'The device “number.wallbox_ladestrom”: Energie-Agent may read or set between 06:00 and 22:00.',
			'Critical actions run without confirmation (allow_critical).'
		]);
		const shopping = describeMandate(de, 'Einkaufs-Agent', rulesOf(exampleDoc('shopping-agent')));
		expect(shopping.map((r) => r.sentences[0])).toEqual([
			'Sensoren im Bereich „vorratsraum“: Einkaufs-Agent darf lesen.',
			'Das Gerät „sensor.kuehlschrank_inhalt“: Einkaufs-Agent darf am Mo, Di, Mi, Do, Fr, Sa lesen.'
		]);
	});

	it('describes limits in the displayed unit', () => {
		const view = readRule({
			id: 'r',
			resource: { category: 'climate' },
			actions: ['set_temperature'],
			decision: 'allow',
			constraints: { temperature: { min: 1600, max: 2350 } }
		});
		expect(describeRule(en, 'A', view)).toEqual(['Heating: A may set temperature (temperature from 16 to 23.5 °C).']);
		expect(describeRule(de, 'A', view)).toEqual(['Heizung: A darf Temperatur einstellen (Temperatur von 16 bis 23,5 °C).']);
		const max = { ...view, constraints: { temperature: { max: 2300 } } };
		expect(describeRule(en, 'A', max)[0]).toContain('(temperature at most 23 °C)');
		const min = { ...view, constraints: { temperature: { min: 1800 } } };
		expect(describeRule(en, 'A', min)[0]).toContain('(temperature at least 18 °C)');
	});

	it('describes days before the time window, and unknown decisions', () => {
		const view: RuleView = {
			id: 'r',
			any: false,
			area: 'garden',
			actions: ['*'],
			decision: 'ask',
			window: { start: '22:00', end: '06:00' },
			weekdays: ['sun', 'sat'],
			constraints: {},
			allowCritical: false
		};
		expect(describeRule(en, 'A', view)[0]).toBe(
			'Every device in area “garden”: A may do anything on Sat, Sun between 22:00 and 06:00, but only after confirmation.'
		);
		expect(describeRule(en, 'A', { ...view, decision: 'maybe' })[0]).toBe('Every device in area “garden”: this rule has no valid decision.');
	});

	it('names the resource', () => {
		const base: RuleView = { id: 'r', any: false, actions: ['read'], decision: 'allow', constraints: {}, allowCritical: false };
		expect(resourcePhrase(en, base)).toBe('no device');
		expect(resourcePhrase(en, { ...base, category: 'light', entityId: 'x', area: 'y' })).toBe('lights (device “x”) in area “y”');
		expect(resourcePhrase(en, { ...base, category: 'acme:robot' })).toBe('acme:robot');
	});
});

describe('texts', () => {
	it('fills placeholders and keeps unknown ones', () => {
		expect(tx({ a: 'x {n} {m}' }, 'a', { n: 1 })).toBe('x 1 {m}');
		expect(tx({}, 'missing')).toBe('missing');
	});
	it('joins lists', () => {
		expect(joinOr(en.texts, [])).toBe('');
		expect(joinOr(en.texts, ['a'])).toBe('a');
		expect(joinOr(de.texts, ['a', 'b', 'c'])).toBe('a, b oder c');
	});
	it('labels actions, units and capitalizes', () => {
		expect(actionLabel(en.texts, '*')).toBe('do anything');
		expect(actionLabel(en.texts, 'zap')).toBe('zap');
		expect(unitLabel(en.texts, { unit: 'percent open' })).toBe('% open');
		expect(unitLabel(en.texts, { unit: 'lux' })).toBe('lux');
		expect(capitalize('über', 'de')).toBe('Über');
	});
});
