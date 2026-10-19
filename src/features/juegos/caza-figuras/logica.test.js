import { describe, expect, it } from 'vitest';
import { calcularMetricas, crearTablero, ESTRELLA, estadoInicial, tocarCelda, todasEncontradas } from './logica.js';

describe('crearTablero', () => {
  it('8 × 4 figuras con 12 estrellas y las demás repartidas entre círculo, triángulo y cuadrado', () => {
    for (let i = 0; i < 20; i++) {
      const figuras = crearTablero();
      expect(figuras).toHaveLength(32);
      expect(figuras.filter((f) => f === ESTRELLA)).toHaveLength(12);
      expect(new Set(figuras)).toEqual(new Set(['estrella', 'circulo', 'triangulo', 'cuadrado']));
    }
  });
});

describe('tocarCelda', () => {
  const figuras = ['estrella', 'circulo', 'estrella', 'cuadrado'];

  it('una estrella cuenta como encontrada y otra figura como equivocada', () => {
    let estado = tocarCelda(estadoInicial(), figuras, 0, 1200);
    estado = tocarCelda(estado, figuras, 1, 2500);
    expect(estado).toMatchObject({ encontradas: 1, equivocadas: 1 });
  });

  it('tocar dos veces la misma celda no cuenta doble', () => {
    let estado = tocarCelda(estadoInicial(), figuras, 1, 100);
    estado = tocarCelda(estado, figuras, 1, 900);
    expect(estado.equivocadas).toBe(1);
  });
});

describe('fin y métricas', () => {
  it('termina al encontrar las 12 estrellas', () => {
    const figuras = crearTablero();
    let estado = estadoInicial();
    figuras.forEach((f, i) => {
      if (f === ESTRELLA) estado = tocarCelda(estado, figuras, i, i * 100);
    });
    expect(todasEncontradas(estado)).toBe(true);
    expect(calcularMetricas(estado, figuras, 30000)).toMatchObject({
      estrellasEncontradas: 12,
      estrellasSinEncontrar: 0,
      figurasEquivocadas: 0,
      tiempoTotalMs: 30000,
      terminoPor: 'todas',
    });
  });

  it('con "Ver resultados" antes de tiempo cuenta las estrellas sin encontrar', () => {
    const figuras = ['estrella', 'circulo', 'estrella'];
    const estado = tocarCelda(tocarCelda(estadoInicial(), figuras, 1, 500), figuras, 0, 900);
    expect(calcularMetricas(estado, figuras, 4000)).toEqual({
      totalEstrellas: 2,
      estrellasEncontradas: 1,
      estrellasSinEncontrar: 11,
      figurasEquivocadas: 1,
      tiempoTotalMs: 4000,
      terminoPor: 'boton',
      toques: [
        { figura: 'circulo', ms: 500 },
        { figura: 'estrella', ms: 900 },
      ],
    });
  });
});
