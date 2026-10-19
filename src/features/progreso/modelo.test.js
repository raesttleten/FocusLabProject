import { describe, expect, it } from 'vitest';
import { ESTADO_DIA } from './diaActual.js';
import {
  cuentosTerminados,
  debeMostrarTransicion,
  nuevoRegistroDia,
  registroTrasTerminarCuento,
  resumirProgreso,
} from './modelo.js';

const colombia = (fechaHora) => new Date(`${fechaHora}-05:00`);
const respuesta = (dia, cuento, indice, completadaEn) => ({
  dia,
  cuento,
  indice,
  completada: true,
  completadaEn: colombia(completadaEn),
});

describe('registro del día', () => {
  it('un día nuevo empieza disponible con los dos cuentos pendientes', () => {
    const fecha = colombia('2026-10-20T08:00:00');
    expect(nuevoRegistroDia(fecha)).toEqual({
      estado: 'disponible',
      fechaInicio: fecha,
      fechaFin: null,
      transicionMostrada: null,
      cuentos: { c1: 'pendiente', c2: 'pendiente' },
      preguntaActual: null,
    });
  });

  it('terminar un cuento no termina el día; terminar los dos sí, en cualquier orden', () => {
    const inicio = nuevoRegistroDia(colombia('2026-10-20T08:00:00'));
    const fin = colombia('2026-10-20T09:00:00');
    const conC2 = registroTrasTerminarCuento(inicio, 'c2', fin);
    expect(conC2.estado).toBe('disponible');
    expect(conC2.fechaFin).toBeNull();
    expect(cuentosTerminados(conC2)).toEqual(['c2']);
    const conAmbos = registroTrasTerminarCuento(conC2, 'c1', fin);
    expect(conAmbos.estado).toBe('terminado');
    expect(conAmbos.fechaFin).toBe(fin);
    expect(conAmbos.preguntaActual).toBeNull();
  });

  it('volver a terminar un cuento no cambia la fecha de fin del día', () => {
    const primerFin = colombia('2026-10-20T09:00:00');
    const terminado = registroTrasTerminarCuento(
      registroTrasTerminarCuento(nuevoRegistroDia(primerFin), 'c1', primerFin),
      'c2',
      primerFin,
    );
    expect(registroTrasTerminarCuento(terminado, 'c1', colombia('2026-10-21T09:00:00')).fechaFin).toBe(primerFin);
  });
});

describe('debeMostrarTransicion', () => {
  const ahora = colombia('2026-10-20T10:00:00');

  it('se muestra al terminar el primer cuento del día', () => {
    const respuestas = [respuesta(1, 'c1', 0, '2026-10-20T09:50:00'), respuesta(1, 'c1', 1, '2026-10-20T09:55:00')];
    expect(debeMostrarTransicion({ respuestas, cuentoId: 'c1', registro: {}, ahora })).toBe(true);
  });

  it('no se muestra al terminar el segundo cuento del día', () => {
    const respuestas = [respuesta(1, 'c1', 0, '2026-10-20T09:00:00'), respuesta(1, 'c2', 0, '2026-10-20T09:50:00')];
    expect(debeMostrarTransicion({ respuestas, cuentoId: 'c2', registro: {}, ahora })).toBe(false);
  });

  it('no se repite si ya se mostró hoy', () => {
    const respuestas = [respuesta(1, 'c1', 0, '2026-10-20T09:50:00')];
    const registro = { transicionMostrada: '2026-10-20' };
    expect(debeMostrarTransicion({ respuestas, cuentoId: 'c1', registro, ahora })).toBe(false);
  });

  it('vuelve a mostrarse otro día aunque el día de lectura sea el mismo', () => {
    const respuestas = [respuesta(1, 'c1', 0, '2026-10-19T09:00:00'), respuesta(1, 'c2', 0, '2026-10-20T09:50:00')];
    const registro = { transicionMostrada: '2026-10-19' };
    expect(debeMostrarTransicion({ respuestas, cuentoId: 'c2', registro, ahora })).toBe(true);
  });
});

describe('resumirProgreso', () => {
  it('sin progreso: día 1, 0 puntos y ningún juego abierto', () => {
    expect(resumirProgreso({}, [], colombia('2026-10-20T08:00:00'))).toEqual({
      diaActual: { dia: 1, estado: ESTADO_DIA.inProgress },
      registroDia: null,
      puntosTotales: 0,
      puntosHoy: 0,
      juegosAbiertos: [],
      todoTerminado: false,
    });
  });

  it('al empezar el día 2: 40 puntos totales, 0 de hoy y los juegos del día 1 abiertos', () => {
    const dias = { 1: { estado: 'terminado', fechaFin: colombia('2026-10-20T09:00:00') } };
    const respuestas = ['c1', 'c2'].flatMap((cuento) => [0, 1].map((i) => respuesta(1, cuento, i, '2026-10-20T08:30:00')));
    const resumen = resumirProgreso(dias, respuestas, colombia('2026-10-21T07:00:00'));
    expect(resumen.diaActual).toEqual({ dia: 2, estado: ESTADO_DIA.inProgress });
    expect(resumen.puntosTotales).toBe(40);
    expect(resumen.puntosHoy).toBe(0);
    expect(resumen.juegosAbiertos).toEqual(['a-todo-foco', 'repite-el-patron']);
  });

  it('los puntos de hoy cuentan solo lo completado en la fecha de hoy', () => {
    const respuestas = [respuesta(1, 'c1', 0, '2026-10-19T09:00:00'), respuesta(1, 'c1', 1, '2026-10-20T09:00:00')];
    const resumen = resumirProgreso({}, respuestas, colombia('2026-10-20T10:00:00'));
    expect(resumen.puntosTotales).toBe(20);
    expect(resumen.puntosHoy).toBe(10);
  });
});
