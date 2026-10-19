import { describe, expect, it } from 'vitest';
import contenido from '../../data/cuentos.json';
import { puntosPorCuento } from '../contenido/cuentos.js';
import { estaDesbloqueado, JUEGOS, juegosDelDia, juegosRecienDesbloqueados } from './catalogo.js';

describe('catálogo de juegos', () => {
  it('coincide con los juegos por día del JSON', () => {
    for (const dia of [1, 2, 3]) {
      expect(juegosDelDia(dia).map((juego) => juego.nombre)).toEqual(contenido.juegos_por_dia[dia]);
    }
  });

  it('usa los umbrales del SPEC', () => {
    expect(JUEGOS.map((juego) => juego.umbral)).toEqual([20, 40, 70, 100, 130, 160]);
  });
});

describe('estaDesbloqueado', () => {
  it('se abre exactamente al llegar al umbral', () => {
    for (const juego of JUEGOS) {
      expect(estaDesbloqueado(juego, juego.umbral - 10)).toBe(false);
      expect(estaDesbloqueado(juego, juego.umbral)).toBe(true);
    }
  });

  it('con 40 puntos solo están abiertos los dos juegos del día 1', () => {
    const abiertos = JUEGOS.filter((juego) => estaDesbloqueado(juego, 40)).map((juego) => juego.id);
    expect(abiertos).toEqual(['a-todo-foco', 'repite-el-patron']);
  });
});

describe('juegosRecienDesbloqueados', () => {
  it('detecta el juego que se abre al terminar un cuento', () => {
    expect(juegosRecienDesbloqueados(0, 20).map((juego) => juego.id)).toEqual(['a-todo-foco']);
    expect(juegosRecienDesbloqueados(40, 70).map((juego) => juego.id)).toEqual(['sigue-el-punto']);
    expect(juegosRecienDesbloqueados(130, 160).map((juego) => juego.id)).toEqual(['caza-figuras']);
  });

  it('no repite un juego que ya estaba abierto', () => {
    expect(juegosRecienDesbloqueados(20, 30)).toEqual([]);
  });
});

describe('recorrido de los 3 días', () => {
  it('cada cuento terminado abre el juego que indica la tabla del SPEC', () => {
    const esperado = [
      [1, 'c1', 'a-todo-foco'],
      [1, 'c2', 'repite-el-patron'],
      [2, 'c1', 'sigue-el-punto'],
      [2, 'c2', 'encuentra-el-par'],
      [3, 'c1', 'semaforo-atento'],
      [3, 'c2', 'caza-figuras'],
    ];
    let puntos = 0;
    for (const [dia, cuento, juego] of esperado) {
      const antes = puntos;
      puntos += puntosPorCuento(dia);
      expect(juegosRecienDesbloqueados(antes, puntos).map((j) => j.id), `día ${dia}, ${cuento}`).toEqual([juego]);
    }
    expect(puntos).toBe(160);
  });
});
