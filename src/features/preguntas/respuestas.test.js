import { describe, expect, it } from 'vitest';
import { getPreguntas } from '../contenido/cuentos.js';
import {
  aplicarToque,
  confirmarOpinion,
  estadoVisual,
  indiceInicial,
  RESULTADO,
  respuestaInicial,
} from './respuestas.js';

const hora = (segundos) => new Date(Date.UTC(2026, 9, 20, 13, 0, segundos));
const preguntaTema = getPreguntas('c1', 1)[0];
const preguntaOpinion = getPreguntas('c1', 2)[2];
const nueva = (pregunta, dia = 1, indice = 0) =>
  respuestaInicial({ dia, cuentoId: 'c1', indice, pregunta, hora: hora(0) });
const incorrecta = (pregunta) => [0, 1, 2, 3].find((i) => i !== pregunta.correcta);

describe('respuestaInicial', () => {
  it('guarda tipo, componente y la hora en que se mostró', () => {
    expect(nueva(preguntaTema)).toEqual({
      dia: 1,
      cuento: 'c1',
      indice: 0,
      tipo: 'Tema',
      componente: 'Tema e idea principal',
      intentos: 0,
      opcionesTocadas: [],
      completada: false,
      mostradaEn: hora(0),
    });
  });
});

describe('aplicarToque en una pregunta con respuesta correcta', () => {
  it('una opción incorrecta se marca rosada y no deja avanzar', () => {
    const r = aplicarToque(nueva(preguntaTema), preguntaTema, incorrecta(preguntaTema), hora(5));
    expect(r.completada).toBe(false);
    expect(estadoVisual(r, preguntaTema)).toEqual({
      seleccion: incorrecta(preguntaTema),
      resultado: RESULTADO.wrong,
      bloqueada: false,
      puedeAvanzar: false,
    });
  });

  it('al tocar una incorrecta y luego otra, solo queda marcada la última', () => {
    const otraIncorrecta = [0, 1, 2, 3].filter((i) => i !== preguntaTema.correcta)[1];
    let r = aplicarToque(nueva(preguntaTema), preguntaTema, incorrecta(preguntaTema), hora(5));
    r = aplicarToque(r, preguntaTema, otraIncorrecta, hora(8));
    expect(estadoVisual(r, preguntaTema).seleccion).toBe(otraIncorrecta);
    expect(r.intentos).toBe(2);
  });

  it('al acertar: verde, puede avanzar y guarda intento, toques con hora y tiempo', () => {
    let r = aplicarToque(nueva(preguntaTema), preguntaTema, incorrecta(preguntaTema), hora(5));
    r = aplicarToque(r, preguntaTema, preguntaTema.correcta, hora(12));
    expect(r.completada).toBe(true);
    expect(r.aciertoEnIntento).toBe(2);
    expect(r.segundosHastaAcertar).toBe(12);
    expect(r.completadaEn).toEqual(hora(12));
    expect(r.opcionesTocadas).toEqual([
      { opcion: ['a', 'b', 'c', 'd'][incorrecta(preguntaTema)], hora: hora(5) },
      { opcion: ['a', 'b', 'c', 'd'][preguntaTema.correcta], hora: hora(12) },
    ]);
    expect(estadoVisual(r, preguntaTema)).toEqual({
      seleccion: preguntaTema.correcta,
      resultado: RESULTADO.correct,
      bloqueada: true,
      puedeAvanzar: true,
    });
  });

  it('después de acertar, tocar otra opción no cambia nada', () => {
    const acertada = aplicarToque(nueva(preguntaTema), preguntaTema, preguntaTema.correcta, hora(3));
    expect(aplicarToque(acertada, preguntaTema, incorrecta(preguntaTema), hora(9))).toBe(acertada);
  });

  it('sin tocar nada no hay selección ni se puede avanzar', () => {
    expect(estadoVisual(nueva(preguntaTema), preguntaTema)).toEqual({
      seleccion: null,
      resultado: null,
      bloqueada: false,
      puedeAvanzar: false,
    });
    expect(estadoVisual(undefined, preguntaTema).puedeAvanzar).toBe(false);
  });
});

describe('preguntas de opinión', () => {
  it('cualquier opción se marca en lila y deja avanzar, pero no se completa hasta "Siguiente"', () => {
    const r = aplicarToque(nueva(preguntaOpinion, 2, 2), preguntaOpinion, 3, hora(4));
    expect(r.completada).toBe(false);
    expect(r.opcionElegida).toBe('d');
    expect(estadoVisual(r, preguntaOpinion)).toEqual({
      seleccion: 3,
      resultado: RESULTADO.opinion,
      bloqueada: false,
      puedeAvanzar: true,
    });
  });

  it('se puede cambiar de opción antes de "Siguiente" y se guarda la última', () => {
    let r = aplicarToque(nueva(preguntaOpinion, 2, 2), preguntaOpinion, 0, hora(4));
    r = aplicarToque(r, preguntaOpinion, 2, hora(7));
    const confirmada = confirmarOpinion(r, hora(9));
    expect(confirmada.opcionElegida).toBe('c');
    expect(confirmada.completada).toBe(true);
    expect(confirmada.segundosHastaAcertar).toBe(9);
  });

  it('no se confirma una opinión sin opción elegida', () => {
    const r = nueva(preguntaOpinion, 2, 2);
    expect(confirmarOpinion(r, hora(9))).toBe(r);
  });
});

describe('indiceInicial', () => {
  const preguntas = getPreguntas('c1', 2);
  const hecha = { completada: true };

  it('empieza en la primera pregunta sin responder', () => {
    expect(indiceInicial({ preguntas, respuestasDelCuento: {}, guardada: undefined })).toBe(0);
    expect(indiceInicial({ preguntas, respuestasDelCuento: { 0: hecha }, guardada: undefined })).toBe(1);
  });

  it('vuelve a la pregunta guardada aunque ya la haya acertado', () => {
    expect(indiceInicial({ preguntas, respuestasDelCuento: { 0: hecha, 1: hecha }, guardada: 1 })).toBe(1);
  });

  it('no deja saltar a una pregunta posterior a la pendiente', () => {
    expect(indiceInicial({ preguntas, respuestasDelCuento: { 0: hecha }, guardada: 2 })).toBe(1);
  });

  it('con todas respondidas queda en la última', () => {
    expect(indiceInicial({ preguntas, respuestasDelCuento: { 0: hecha, 1: hecha, 2: hecha }, guardada: undefined })).toBe(2);
  });
});
