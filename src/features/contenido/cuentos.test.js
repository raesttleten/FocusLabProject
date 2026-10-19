import { describe, expect, it } from 'vitest';
import contenido from '../../data/cuentos.json';
import {
  esOpinion,
  getPreguntas,
  preguntasPorCuento,
  puntosPorCuento,
  puntosPosibles,
  respuestaId,
  segmentarResaltado,
  validarContenido,
} from './cuentos.js';

describe('contenido de cuentos.json', () => {
  it('es válido', () => {
    expect(validarContenido(contenido)).toEqual([]);
  });

  it('tiene 2, 3 y 3 preguntas por cuento y suma 160 puntos', () => {
    expect([1, 2, 3].map(preguntasPorCuento)).toEqual([2, 3, 3]);
    expect([1, 2, 3].map(puntosPorCuento)).toEqual([20, 30, 30]);
    expect(puntosPosibles()).toBe(160);
  });

  it('la pregunta 3 del día 2 es de opinión en ambos cuentos', () => {
    expect(esOpinion(getPreguntas('c1', 2)[2])).toBe(true);
    expect(esOpinion(getPreguntas('c2', 2)[2])).toBe(true);
    expect(esOpinion(getPreguntas('c1', 1)[0])).toBe(false);
  });

  it('cada cuento tiene una palabra resaltada', () => {
    for (const cuento of contenido.cuentos) {
      const resaltados = cuento.parrafos
        .flatMap(segmentarResaltado)
        .filter((segmento) => segmento.resaltado);
      expect(resaltados.length).toBeGreaterThan(0);
    }
  });

  it('no usa rayas, guiones largos ni comillas angulares', () => {
    expect(JSON.stringify(contenido)).not.toMatch(/[–—«»]/);
  });
});

describe('validarContenido', () => {
  it('detecta una pregunta sin pista y con "correcta" fuera de rango', () => {
    const roto = structuredClone(contenido);
    delete roto.cuentos[0].preguntas['1'][0].pista;
    roto.cuentos[0].preguntas['1'][1].correcta = 4;
    const errores = validarContenido(roto);
    expect(errores).toContain('c1, día 1, pregunta 1: falta "pista"');
    expect(errores).toContain('c1, día 1, pregunta 2: "correcta" debe ser 0 a 3 o null');
  });
});

describe('segmentarResaltado', () => {
  it('separa la palabra marcada con ==', () => {
    expect(segmentarResaltado('Mírela con ==toda su atención==.')).toEqual([
      { texto: 'Mírela con ', resaltado: false },
      { texto: 'toda su atención', resaltado: true },
      { texto: '.', resaltado: false },
    ]);
  });

  it('deja igual un texto sin marcas', () => {
    expect(segmentarResaltado('Hola.')).toEqual([{ texto: 'Hola.', resaltado: false }]);
  });
});

describe('respuestaId', () => {
  it('arma el id fijo dia_cuento_indice', () => {
    expect(respuestaId(2, 'c1', 0)).toBe('2_c1_0');
  });
});
