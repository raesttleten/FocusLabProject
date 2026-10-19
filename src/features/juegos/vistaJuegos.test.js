import { describe, expect, it } from 'vitest';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { vistaJuegos } from './vistaJuegos.js';

const enCurso = (dia) => ({ dia, estado: ESTADO_DIA.inProgress });

describe('vistaJuegos', () => {
  it('día 1 con 40 puntos: como el Figma 5.01', () => {
    const { columnas, aviso } = vistaJuegos({ diaActual: enCurso(1), puntosTotales: 40 });
    expect(columnas.map((c) => c.etiqueta)).toEqual(['DÍA 1 · HOY', 'DÍA 2 · SE ABRE MAÑANA', 'DÍA 3 · SE ABRE EN 2 DÍAS']);
    expect(columnas[0].juegos.map((j) => j.abierto)).toEqual([true, true]);
    expect(columnas[1].juegos.map((j) => j.aviso)).toEqual([
      'Se desbloquea con 70 puntos · vuelve mañana',
      'Se desbloquea con 100 puntos · vuelve mañana',
    ]);
    expect(columnas[2].juegos[1].aviso).toBe('Se desbloquea con 160 puntos · vuelve en 2 días');
    expect(aviso.titulo).toBe('¿Quieres jugar a los otros?');
  });

  it('un juego de hoy aún sin puntos dice solo con cuántos puntos se abre', () => {
    const { columnas } = vistaJuegos({ diaActual: enCurso(1), puntosTotales: 20 });
    expect(columnas[0].juegos.map((j) => j.aviso)).toEqual([null, 'Se desbloquea con 40 puntos']);
  });

  it('cada juego se abre exactamente al llegar a sus puntos', () => {
    const umbrales = [20, 40, 70, 100, 130, 160];
    umbrales.forEach((umbral, i) => {
      const abiertos = vistaJuegos({ diaActual: enCurso(3), puntosTotales: umbral })
        .columnas.flatMap((c) => c.juegos)
        .filter((j) => j.abierto);
      expect(abiertos).toHaveLength(i + 1);
    });
  });

  it('con todo terminado: días sin "HOY" y aviso de juegos abiertos', () => {
    const { columnas, aviso } = vistaJuegos({ diaActual: { dia: 3, estado: ESTADO_DIA.allDone }, puntosTotales: 160 });
    expect(columnas.map((c) => c.etiqueta)).toEqual(['DÍA 1', 'DÍA 2', 'DÍA 3']);
    expect(aviso.titulo).toBe('¡Abriste todos los juegos!');
  });

  it('el día 3 en curso no muestra el aviso de volver mañana', () => {
    expect(vistaJuegos({ diaActual: enCurso(3), puntosTotales: 100 }).aviso).toBeNull();
  });
});
