import { describe, expect, it } from 'vitest';
import { calcularPuntos, calcularPuntosDeHoy, calcularPuntosDelDia } from './puntos.js';

const respuesta = (dia, cuento, indice, completada = true) => ({ dia, cuento, indice, completada });

describe('calcularPuntos', () => {
  it('da 10 puntos por respuesta completada', () => {
    expect(calcularPuntos([])).toBe(0);
    expect(calcularPuntos([respuesta(1, 'c1', 0), respuesta(1, 'c1', 1)])).toBe(20);
  });

  it('no cuenta respuestas sin completar', () => {
    expect(calcularPuntos([respuesta(1, 'c1', 0), respuesta(1, 'c1', 1, false)])).toBe(10);
  });

  it('no duplica la misma respuesta guardada desde dos equipos', () => {
    expect(calcularPuntos([respuesta(2, 'c2', 1), respuesta(2, 'c2', 1)])).toBe(10);
  });
});

describe('calcularPuntosDelDia', () => {
  it('solo suma las respuestas de ese día', () => {
    const respuestas = [respuesta(1, 'c1', 0), respuesta(1, 'c1', 1), respuesta(2, 'c1', 0)];
    expect(calcularPuntosDelDia(respuestas, 1)).toBe(20);
    expect(calcularPuntosDelDia(respuestas, 2)).toBe(10);
    expect(calcularPuntosDelDia(respuestas, 3)).toBe(0);
  });
});

describe('calcularPuntosDeHoy', () => {
  const colombia = (fechaHora) => new Date(`${fechaHora}-05:00`);
  const hecha = (indice, completadaEn) => ({ ...respuesta(1, 'c1', indice), completadaEn: colombia(completadaEn) });

  it('cuenta solo lo completado hoy en hora de Colombia', () => {
    const respuestas = [hecha(0, '2026-10-19T23:59:00'), hecha(1, '2026-10-20T00:01:00')];
    expect(calcularPuntosDeHoy(respuestas, colombia('2026-10-20T12:00:00'))).toBe(10);
  });

  it('vuelve a 0 al empezar un nuevo día', () => {
    expect(calcularPuntosDeHoy([hecha(0, '2026-10-20T10:00:00')], colombia('2026-10-21T00:00:00'))).toBe(0);
  });

  it('ignora respuestas sin fecha de completado', () => {
    expect(calcularPuntosDeHoy([respuesta(1, 'c1', 0)], colombia('2026-10-20T12:00:00'))).toBe(0);
  });
});
