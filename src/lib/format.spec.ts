import { describe, expect, it } from 'vitest';
import { formatARS } from './format';

describe('formatARS', () => {
	it('formatea un entero', () => {
		expect(formatARS(100)).toContain('100');
	});

	it('formatea decimales con coma', () => {
		expect(formatARS(0.7)).toContain('0,70');
	});

	it('usa separador de miles en montos grandes', () => {
		expect(formatARS(1250000)).toContain('1.250.000');
	});

	it('acepta strings (PostgREST devuelve numeric como string)', () => {
		expect(formatARS('170.5')).toContain('170,50');
	});
});