import { describe, expect, it } from 'vitest';
import {
  calcularMetricas,
  crearSecuencia,
  empezarTurno,
  FASE,
  LONGITUD_MAXIMA,
  nuevaPartida,
  reintentar,
  terminado,
  tocarCuadro,
} from './logica.js';

const fijo = () => 0.4;

function repetir(estado, secuencia = estado.secuencia) {
  let actual = estado;
  for (const cuadro of secuencia) actual = tocarCuadro(actual, cuadro, 1000, fijo);
  return actual;
}

function equivocar(estado) {
  return tocarCuadro(estado, (estado.secuencia[estado.paso] + 1) % 4, 800, fijo);
}

describe('crearSecuencia', () => {
  it('usa los 4 cuadros y no repite el mismo cuadro seguido', () => {
    for (let i = 0; i < 30; i++) {
      const secuencia = crearSecuencia(8);
      expect(secuencia).toHaveLength(8);
      secuencia.forEach((c, j) => {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(4);
        if (j > 0) expect(c).not.toBe(secuencia[j - 1]);
      });
    }
  });
});

describe('partida', () => {
  it('empieza con una secuencia de 3 y mostrándola', () => {
    const estado = nuevaPartida(fijo);
    expect(estado.longitud).toBe(3);
    expect(estado.secuencia).toHaveLength(3);
    expect(estado.fase).toBe(FASE.showing);
  });

  it('no acepta toques mientras se muestra el patrón', () => {
    const estado = nuevaPartida(fijo);
    expect(tocarCuadro(estado, estado.secuencia[0], 10)).toBe(estado);
  });

  it('al repetir bien, sube 1 cuadro y vuelve a mostrar', () => {
    const estado = repetir(empezarTurno(nuevaPartida(fijo)));
    expect(estado.longitud).toBe(4);
    expect(estado.secuencia).toHaveLength(4);
    expect(estado.aciertos).toBe(1);
    expect(estado.mejor).toBe(3);
    expect(estado.fase).toBe(FASE.showing);
  });

  it('el primer error da otra oportunidad con la misma longitud', () => {
    let estado = repetir(empezarTurno(nuevaPartida(fijo)));
    estado = equivocar(empezarTurno(estado));
    expect(estado.fase).toBe(FASE.retry);
    expect(estado.errores).toBe(1);
    expect(estado.longitud).toBe(4);
    expect(reintentar(estado).fase).toBe(FASE.showing);
  });

  it('se acaba al fallar 2 veces', () => {
    let estado = equivocar(empezarTurno(nuevaPartida(fijo)));
    estado = equivocar(empezarTurno(reintentar(estado)));
    expect(estado.fase).toBe(FASE.finishedByErrors);
    expect(terminado(estado)).toBe(true);
  });

  it('los 2 errores no tienen que ser seguidos', () => {
    let estado = equivocar(empezarTurno(nuevaPartida(fijo)));
    estado = repetir(empezarTurno(reintentar(estado)));
    estado = equivocar(empezarTurno(estado));
    expect(estado.fase).toBe(FASE.finishedByErrors);
    expect(calcularMetricas(estado)).toMatchObject({ secuenciaMasLarga: 3, aciertos: 1, errores: 2 });
  });

  it('termina al completar la secuencia más larga posible', () => {
    let estado = nuevaPartida(fijo);
    while (!terminado(estado)) estado = repetir(empezarTurno(estado));
    expect(estado.fase).toBe(FASE.finishedByMax);
    expect(estado.mejor).toBe(LONGITUD_MAXIMA);
    expect(estado.aciertos).toBe(LONGITUD_MAXIMA - 2);
  });

  it('guarda cada ronda con su longitud, si la acertó y el tiempo', () => {
    let estado = repetir(empezarTurno(nuevaPartida(fijo)));
    estado = equivocar(empezarTurno(estado));
    expect(calcularMetricas(estado).rondas).toEqual([
      { longitud: 3, acertada: true, ms: 1000 },
      { longitud: 4, acertada: false, ms: 800 },
    ]);
  });
});
