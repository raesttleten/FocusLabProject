import { describe, expect, it } from 'vitest';
import { calcularMetricas, crearSecuencia, LETRA_OBJETIVO, registrarToque, resultadoToque } from './logica.js';

function semilla(valor) {
  let estado = valor;
  return () => {
    estado = (estado * 16807) % 2147483647;
    return (estado - 1) / 2147483646;
  };
}

describe('crearSecuencia', () => {
  it('tiene 36 letras y exactamente 9 X', () => {
    for (let s = 1; s <= 20; s++) {
      const secuencia = crearSecuencia({ aleatorio: semilla(s) });
      expect(secuencia).toHaveLength(36);
      expect(secuencia.filter((l) => l === LETRA_OBJETIVO)).toHaveLength(9);
    }
  });

  it('no repite la misma letra distractora dos veces seguidas', () => {
    const secuencia = crearSecuencia({ aleatorio: semilla(7) });
    secuencia.forEach((letra, i) => {
      if (i > 0 && letra !== LETRA_OBJETIVO) expect(letra).not.toBe(secuencia[i - 1]);
    });
  });

  it('cambia de una partida a otra', () => {
    expect(crearSecuencia({ aleatorio: semilla(1) }).join('')).not.toBe(crearSecuencia({ aleatorio: semilla(2) }).join(''));
  });
});

describe('registrarToque', () => {
  it('solo cuenta el primer toque de cada letra', () => {
    let toques = registrarToque({}, 3, 420.4);
    toques = registrarToque(toques, 3, 900);
    expect(toques).toEqual({ 3: 420 });
  });
});

describe('resultadoToque', () => {
  it('verde en la X, rojizo en otra letra y nada si no tocó', () => {
    expect(resultadoToque('X', true)).toBe('acierto');
    expect(resultadoToque('K', true)).toBe('error');
    expect(resultadoToque('X', false)).toBeNull();
  });
});

describe('calcularMetricas', () => {
  const secuencia = ['K', 'X', 'M', 'X', 'P', 'X'];

  it('cuenta X tocadas, X que se escaparon, toques en otra letra y tiempo de reacción', () => {
    const metricas = calcularMetricas(secuencia, { 1: 400, 3: 500, 4: 300 });
    expect(metricas).toEqual({
      totalLetras: 6,
      totalX: 3,
      xTocadas: 2,
      xEscapadas: 1,
      toquesOtraLetra: 1,
      tiempoReaccionPromedioMs: 450,
      tiemposReaccionMs: [400, 500],
    });
  });

  it('sin X tocadas no hay tiempo de reacción', () => {
    expect(calcularMetricas(secuencia, {}).tiempoReaccionPromedioMs).toBeNull();
  });
});
