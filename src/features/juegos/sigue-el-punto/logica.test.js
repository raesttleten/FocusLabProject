import { describe, expect, it } from 'vitest';
import { calcularMetricas, crearPuntos, elegirMarcado, moverPuntos, nivelConcentracion, TOTAL_PUNTOS } from './logica.js';

describe('crearPuntos', () => {
  it('crea 6 puntos dentro del área, separados y en movimiento', () => {
    for (let i = 0; i < 20; i++) {
      const puntos = crearPuntos();
      expect(puntos).toHaveLength(TOTAL_PUNTOS);
      for (const p of puntos) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1);
        expect(Math.hypot(p.vx, p.vy)).toBeGreaterThan(0);
      }
    }
  });
});

describe('moverPuntos', () => {
  it('avanza según la velocidad', () => {
    const [p] = moverPuntos([{ x: 0.5, y: 0.5, vx: 0.1, vy: -0.2 }], 1);
    expect(p.x).toBeCloseTo(0.6);
    expect(p.y).toBeCloseTo(0.3);
  });

  it('rebota en los bordes y nunca sale del área', () => {
    const [p] = moverPuntos([{ x: 0.95, y: 0.02, vx: 0.2, vy: -0.1 }], 0.5);
    expect(p.x).toBeCloseTo(0.95);
    expect(p.vx).toBeLessThan(0);
    expect(p.y).toBeCloseTo(0.03);
    expect(p.vy).toBeGreaterThan(0);
    let puntos = crearPuntos();
    for (let i = 0; i < 480; i++) puntos = moverPuntos(puntos, 1 / 60);
    for (const q of puntos) {
      expect(q.x).toBeGreaterThanOrEqual(0);
      expect(q.x).toBeLessThanOrEqual(1);
      expect(q.y).toBeGreaterThanOrEqual(0);
      expect(q.y).toBeLessThanOrEqual(1);
    }
  });
});

describe('elegirMarcado', () => {
  it('elige uno de los 6 puntos', () => {
    expect(elegirMarcado(() => 0)).toBe(0);
    expect(elegirMarcado(() => 0.999)).toBe(5);
  });
});

describe('resultados', () => {
  it('cuenta rondas acertadas y el tiempo de respuesta promedio', () => {
    const rondas = [
      { acertada: true, ms: 900 },
      { acertada: false, ms: 1500 },
      { acertada: true, ms: 1200 },
    ];
    expect(calcularMetricas(rondas)).toEqual({ totalRondas: 3, rondasAcertadas: 2, tiempoRespuestaPromedioMs: 1200, rondas });
  });

  it('nivel de concentración visual sin palabras negativas', () => {
    expect([0, 1, 2, 3, 4, 5].map(nivelConcentracion)).toEqual(['En práctica', 'En práctica', 'Media', 'Media', 'Alta', 'Alta']);
  });
});
