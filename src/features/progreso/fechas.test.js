import { describe, expect, it } from 'vitest';
import { desplazarAFecha, diasEntre, fechaColombia } from './fechas.js';

describe('fechaColombia', () => {
  it('convierte a la fecha de Bogotá (UTC-5)', () => {
    expect(fechaColombia(new Date('2026-10-21T04:59:59Z'))).toBe('2026-10-20');
    expect(fechaColombia(new Date('2026-10-21T05:00:00Z'))).toBe('2026-10-21');
  });
});

describe('diasEntre', () => {
  it('cuenta días de calendario, también entre meses y años', () => {
    expect(diasEntre('2026-10-20', '2026-10-22')).toBe(2);
    expect(diasEntre('2026-10-31', '2026-11-01')).toBe(1);
    expect(diasEntre('2026-12-31', '2027-01-01')).toBe(1);
    expect(diasEntre('2026-10-22', '2026-10-20')).toBe(-2);
  });
});

describe('desplazarAFecha', () => {
  it('lleva la fecha a otro día conservando la hora', () => {
    const real = new Date('2026-10-18T15:30:00-05:00');
    const simulada = desplazarAFecha(real, '2026-10-20');
    expect(fechaColombia(simulada)).toBe('2026-10-20');
    expect(simulada.toISOString()).toBe('2026-10-20T20:30:00.000Z');
  });
});
