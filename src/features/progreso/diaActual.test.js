import { describe, expect, it } from 'vitest';
import { calcularDiaActual, ESTADO_DIA } from './diaActual.js';

const colombia = (fechaHora) => new Date(`${fechaHora}-05:00`);
const terminado = (fechaHora) => ({ estado: 'terminado', fechaFin: colombia(fechaHora) });

describe('calcularDiaActual', () => {
  it('empieza en el día 1 sin progreso', () => {
    expect(calcularDiaActual({}, colombia('2026-10-20T08:00:00'))).toEqual({
      dia: 1,
      estado: ESTADO_DIA.inProgress,
    });
    expect(calcularDiaActual(undefined, colombia('2026-10-20T08:00:00')).dia).toBe(1);
  });

  it('sigue en el mismo día si no lo terminó, aunque pasen varios días', () => {
    const dias = { 1: { estado: 'disponible', fechaInicio: colombia('2026-10-20T08:00:00') } };
    expect(calcularDiaActual(dias, colombia('2026-10-25T08:00:00'))).toEqual({
      dia: 1,
      estado: ESTADO_DIA.inProgress,
    });
  });

  it('muestra "terminado por hoy" el mismo día en que terminó', () => {
    const dias = { 1: terminado('2026-10-20T09:30:00') };
    expect(calcularDiaActual(dias, colombia('2026-10-20T23:59:59'))).toEqual({
      dia: 1,
      estado: ESTADO_DIA.finishedToday,
    });
  });

  it('abre el día 2 a las 00:00 del día siguiente, en hora de Colombia', () => {
    const dias = { 1: terminado('2026-10-20T22:00:00') };
    expect(calcularDiaActual(dias, colombia('2026-10-21T00:00:00'))).toEqual({
      dia: 2,
      estado: ESTADO_DIA.inProgress,
    });
  });

  it('usa la fecha de Colombia y no la de UTC', () => {
    const dias = { 1: terminado('2026-10-20T20:00:00') };
    expect(calcularDiaActual(dias, new Date('2026-10-21T03:00:00Z')).estado).toBe(
      ESTADO_DIA.finishedToday,
    );
  });

  it('no se salta días: después de terminar el día 1 hace semanas, va al día 2', () => {
    const dias = { 1: terminado('2026-09-01T10:00:00') };
    expect(calcularDiaActual(dias, colombia('2026-10-20T10:00:00')).dia).toBe(2);
  });

  it('no avanza si el reloj del equipo va atrás respecto al fin del día', () => {
    const dias = { 1: terminado('2026-10-20T10:00:00') };
    expect(calcularDiaActual(dias, colombia('2026-10-19T10:00:00'))).toEqual({
      dia: 1,
      estado: ESTADO_DIA.finishedToday,
    });
  });

  it('día 3 terminado hoy muestra "terminado por hoy" y desde mañana el cierre', () => {
    const dias = {
      1: terminado('2026-10-20T10:00:00'),
      2: terminado('2026-10-21T10:00:00'),
      3: terminado('2026-10-22T10:00:00'),
    };
    expect(calcularDiaActual(dias, colombia('2026-10-22T18:00:00'))).toEqual({
      dia: 3,
      estado: ESTADO_DIA.finishedToday,
    });
    expect(calcularDiaActual(dias, colombia('2026-10-23T08:00:00'))).toEqual({
      dia: 3,
      estado: ESTADO_DIA.allDone,
    });
  });

  it('acepta fechas de Firestore (objetos con toDate)', () => {
    const fechaFin = { toDate: () => colombia('2026-10-20T10:00:00') };
    const dias = { 1: { estado: 'terminado', fechaFin } };
    expect(calcularDiaActual(dias, colombia('2026-10-21T10:00:00')).dia).toBe(2);
  });

  it('un día sin fechaFin no cuenta como terminado', () => {
    const dias = { 1: { estado: 'terminado' } };
    expect(calcularDiaActual(dias, colombia('2026-10-21T10:00:00'))).toEqual({
      dia: 1,
      estado: ESTADO_DIA.inProgress,
    });
  });
});
