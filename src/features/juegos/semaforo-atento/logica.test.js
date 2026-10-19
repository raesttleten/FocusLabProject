import { describe, expect, it } from 'vitest';
import { calcularMetricas, crearSecuencia, registrarToque, ROJA, VERDE } from './logica.js';

describe('crearSecuencia', () => {
  it('10 luces con 6 verdes, en otro orden cada partida', () => {
    const vistas = new Set();
    for (let i = 0; i < 20; i++) {
      const secuencia = crearSecuencia();
      expect(secuencia).toHaveLength(10);
      expect(secuencia.filter((l) => l === VERDE)).toHaveLength(6);
      vistas.add(secuencia.join());
    }
    expect(vistas.size).toBeGreaterThan(1);
  });
});

describe('registrarToque', () => {
  it('solo cuenta el primer toque de cada luz', () => {
    expect(registrarToque(registrarToque({}, 2, 480.6), 2, 900)).toEqual({ 2: 481 });
  });
});

describe('calcularMetricas', () => {
  it('verdes tocadas, verdes que se escaparon, rojas tocadas y tiempo de reacción', () => {
    const secuencia = [VERDE, ROJA, VERDE, VERDE, ROJA];
    expect(calcularMetricas(secuencia, { 0: 400, 1: 300, 3: 600 })).toEqual({
      totalLuces: 5,
      totalVerdes: 3,
      verdesTocadas: 2,
      verdesEscapadas: 1,
      rojasTocadas: 1,
      tiempoReaccionPromedioMs: 500,
      tiemposReaccionMs: [400, 600],
    });
  });

  it('sin verdes tocadas no hay tiempo de reacción', () => {
    expect(calcularMetricas([VERDE, ROJA], {}).tiempoReaccionPromedioMs).toBeNull();
  });
});
