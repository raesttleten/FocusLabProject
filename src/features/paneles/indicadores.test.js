import { describe, expect, it } from 'vitest';
import { metricasComunes } from '../juegos/metricasComunes.js';
import { aCsv, filasJuegos, filasLecturas, filasRespuestas } from './csv.js';
import { tiempo } from './formato.js';
import {
  aciertosPrimerIntento,
  detalleDocente,
  diaDeEstudio,
  diaEnQueVa,
  filaDocente,
  filaInvestigadora,
  promedioLecturaPorCuento,
  resumenDocente,
  resumenInvestigadora,
  TODO,
} from './indicadores.js';

const h = (fechaHora) => new Date(`${fechaHora}-05:00`);

const respuesta = (dia, cuento, indice, intentos, extra = {}) => ({
  dia,
  cuento,
  indice,
  intentos,
  completada: true,
  aciertoEnIntento: intentos,
  segundosHastaAcertar: 5 * intentos,
  opcionesTocadas: Array.from({ length: intentos }, (_, i) => ({ opcion: 'abcd'[i], hora: h('2026-10-19T09:00:00') })),
  mostradaEn: h(`2026-10-${dia === 1 ? 19 : 20}T09:00:00`),
  completadaEn: h(`2026-10-${dia === 1 ? 19 : 20}T09:0${indice + 1}:00`),
  ...extra,
});

function estudianteA() {
  return {
    uid: 'a',
    codigo: 'E01',
    dias: {
      1: { estado: 'terminado', fechaInicio: h('2026-10-19T08:55:00'), fechaFin: h('2026-10-19T09:30:00'), cuentos: { c1: 'terminado', c2: 'terminado' } },
      2: { estado: 'disponible', fechaInicio: h('2026-10-20T08:55:00'), fechaFin: null, cuentos: { c1: 'terminado', c2: 'pendiente' } },
    },
    respuestas: [
      respuesta(1, 'c1', 0, 1),
      respuesta(1, 'c1', 1, 2),
      respuesta(1, 'c2', 0, 1),
      respuesta(1, 'c2', 1, 1),
      respuesta(2, 'c1', 0, 1),
      respuesta(2, 'c1', 1, 3),
      respuesta(2, 'c1', 2, 1, { aciertoEnIntento: undefined, opcionElegida: 'b' }),
      { dia: 2, cuento: 'c2', indice: 0, intentos: 0, completada: false, opcionesTocadas: [], mostradaEn: h('2026-10-20T10:00:00') },
    ],
    lecturas: [
      { dia: 1, cuento: 'c1', modo: 'primera', segundos: 120, fecha: h('2026-10-19T08:58:00') },
      { dia: 1, cuento: 'c1', modo: 'primera', segundos: 30, fecha: h('2026-10-19T09:01:30') },
      { dia: 1, cuento: 'c2', modo: 'primera', segundos: 90, fecha: h('2026-10-19T09:10:00') },
      { dia: 1, cuento: 'c1', modo: 'repaso', segundos: 60, fecha: h('2026-10-19T09:40:00') },
      { dia: 2, cuento: 'c1', modo: 'primera', segundos: 200, fecha: h('2026-10-20T09:00:00') },
    ],
    juegos: [
      { juego: 'a-todo-foco', fechaInicio: h('2026-10-19T09:35:00'), duracion: 70, metricas: { xTocadas: 8, toquesOtraLetra: 2, xEscapadas: 1, tiempoReaccionPromedioMs: 600 } },
      { juego: 'repite-el-patron', fechaInicio: h('2026-10-20T09:20:00'), duracion: 90, metricas: { aciertos: 4, errores: 2, secuenciaMasLarga: 5 } },
    ],
    actividad: [
      { inicio: h('2026-10-19T08:50:00'), fin: h('2026-10-19T09:50:00'), segundosActivos: 3000, segundosInactivos: 600, salidas: 1 },
      { inicio: h('2026-10-20T08:50:00'), fin: h('2026-10-20T09:30:00'), segundosActivos: 2000, segundosInactivos: 400, salidas: 0 },
    ],
  };
}

const estudianteSinEmpezar = () => ({ uid: 'b', codigo: 'E02', dias: {}, respuestas: [], lecturas: [], juegos: [], actividad: [] });

describe('indicadores de los paneles', () => {
  it('los aciertos al primer intento ignoran las preguntas de opinión y las no terminadas', () => {
    expect(aciertosPrimerIntento(estudianteA().respuestas)).toEqual({ aciertos: 4, total: 6, porcentaje: (4 / 6) * 100 });
  });

  it('el día de estudio de un evento sale de las fechas de inicio de cada día', () => {
    const { dias } = estudianteA();
    expect(diaDeEstudio(dias, h('2026-10-19T15:00:00'))).toBe(1);
    expect(diaDeEstudio(dias, h('2026-10-20T07:00:00'))).toBe(2);
    expect(diaDeEstudio(dias, h('2026-10-18T07:00:00'))).toBe(null);
  });

  it('el tiempo por cuento suma solo las lecturas de primera vez del mismo cuento', () => {
    expect(promedioLecturaPorCuento([estudianteA().lecturas])).toBeCloseTo((150 + 90 + 200) / 3);
  });

  it('fila del docente con todo el piloto y con un solo día', () => {
    const ahora = h('2026-10-20T12:00:00');
    const todo = filaDocente(estudianteA(), TODO, ahora);
    expect(todo).toMatchObject({ codigo: 'E01', cuentosTerminados: 3, cuentosPosibles: 6, puntos: 70, segundosLectura: 440 });
    expect(todo.lecturasPorDia).toEqual([{ dia: 1, terminadas: 2 }, { dia: 2, terminadas: 1 }, { dia: 3, terminadas: 0 }]);
    expect(todo.diaEnQueVa).toEqual({ dia: 2, texto: 'Día 2', estado: 'en-curso' });
    expect(todo.ultimoIngreso.getTime()).toBe(h('2026-10-20T10:00:00').getTime());
    const dia1 = filaDocente(estudianteA(), 1, ahora);
    expect(dia1).toMatchObject({ cuentosTerminados: 2, cuentosPosibles: 2, puntos: 40, segundosLectura: 240 });
    expect(dia1.lecturasPorDia).toEqual([{ dia: 1, terminadas: 2 }]);
    expect(dia1.primerIntento.porcentaje).toBe(75);
  });

  it('un estudiante sin datos aparece "Sin empezar" y sin último ingreso', () => {
    const fila = filaDocente(estudianteSinEmpezar(), TODO, h('2026-10-20T12:00:00'));
    expect(fila.diaEnQueVa.texto).toBe('Sin empezar');
    expect(fila.ultimoIngreso).toBe(null);
    expect(fila.primerIntento.porcentaje).toBe(null);
  });

  it('resumen del docente: activos hoy y cuentos terminados hoy', () => {
    const resumen = resumenDocente([estudianteA(), estudianteSinEmpezar()], TODO, h('2026-10-20T12:00:00'));
    expect(resumen).toMatchObject({ total: 2, activosHoy: 1, cuentosHoy: 1, cuentosPosiblesHoy: 4 });
    const ayer = resumenDocente([estudianteA()], TODO, h('2026-10-19T20:00:00'));
    expect(ayer.cuentosHoy).toBe(2);
  });

  it('el detalle del docente muestra intentos por pregunta y juegos por día', () => {
    const [d1, d2, d3] = detalleDocente(estudianteA());
    expect(d1.cuentos[0]).toMatchObject({ terminado: true, segundosLectura: 150 });
    expect(d1.cuentos[0].preguntas.map((p) => p.intentos)).toEqual([1, 2]);
    expect(d2.cuentos[0].preguntas[2]).toMatchObject({ opinion: true, intentos: 1 });
    expect(d1.juegos).toEqual([{ juego: 'a-todo-foco', partidas: 1 }]);
    expect(d2.juegos).toEqual([{ juego: 'repite-el-patron', partidas: 1 }]);
    expect(d3.empezado).toBe(false);
  });

  it('fila de la investigadora con componentes, intentos, tiempo activo y juegos', () => {
    const fila = filaInvestigadora(estudianteA(), TODO);
    expect(fila.diasTerminados).toBe(1);
    expect(fila.porComponente.map((c) => c.porcentaje)).toEqual([75, 50, null]);
    expect(fila.promedioIntentos).toBeCloseTo(9 / 6);
    expect(fila).toMatchObject({ segundosActivos: 5000, segundosInactivos: 1000, salidas: 1, partidas: 2 });
    expect(fila.juegos).toEqual({ aciertos: 6, errores: 2, omisiones: 1, tiempoReaccionMs: 600 });
    expect(filaInvestigadora(estudianteA(), 2)).toMatchObject({ partidas: 1, segundosActivos: 2000, diasTerminados: 0, diasPosibles: 1 });
  });

  it('resumen de la investigadora', () => {
    const resumen = resumenInvestigadora([estudianteA(), estudianteSinEmpezar()], TODO);
    expect(resumen).toMatchObject({ total: 2, participantes: 1, diasCompletados: 1 });
    expect(resumen.porComponente.map((c) => c.total)).toEqual([4, 2, 0]);
  });

  it('el día en que va pasa a "Terminó" con los 3 días hechos después del último', () => {
    const e = estudianteA();
    e.dias[2] = { ...e.dias[1], fechaInicio: h('2026-10-20T08:00:00'), fechaFin: h('2026-10-20T09:00:00') };
    e.dias[3] = { ...e.dias[1], fechaInicio: h('2026-10-21T08:00:00'), fechaFin: h('2026-10-21T09:00:00') };
    expect(diaEnQueVa(e, h('2026-10-22T08:00:00')).texto).toBe('Terminó');
    expect(diaEnQueVa(e, h('2026-10-21T10:00:00')).texto).toBe('Terminó');
  });
});

describe('métricas comunes de los juegos', () => {
  it('cada juego se traduce a aciertos, errores, omisiones y tiempo de reacción', () => {
    expect(metricasComunes({ juego: 'encuentra-el-par', metricas: { totalRondas: 6, rondasAcertadas: 5, toquesErrados: 3, tiempoPromedioPorParMs: 2100 } }))
      .toEqual({ aciertos: 5, errores: 3, omisiones: 1, tiempoReaccionMs: 2100 });
    expect(metricasComunes({ juego: 'semaforo-atento', metricas: { verdesTocadas: 10, rojasTocadas: 1, verdesEscapadas: 2, tiempoReaccionPromedioMs: null } }))
      .toEqual({ aciertos: 10, errores: 1, omisiones: 2, tiempoReaccionMs: null });
    expect(metricasComunes({ juego: 'sigue-el-punto', metricas: { totalRondas: 5, rondasAcertadas: 4, tiempoRespuestaPromedioMs: 1500 } }))
      .toEqual({ aciertos: 4, errores: 1, omisiones: null, tiempoReaccionMs: 1500 });
    expect(metricasComunes({ juego: 'caza-figuras', metricas: { estrellasEncontradas: 11, figurasEquivocadas: 2, estrellasSinEncontrar: 1 } }))
      .toEqual({ aciertos: 11, errores: 2, omisiones: 1, tiempoReaccionMs: null });
    expect(metricasComunes({ juego: 'otro', metricas: {} })).toEqual({ aciertos: null, errores: null, omisiones: null, tiempoReaccionMs: null });
  });
});

describe('exportación a CSV', () => {
  it('respuestas: una fila por pregunta respondida, solo con el código', () => {
    const filas = filasRespuestas([estudianteA()]);
    expect(filas).toHaveLength(7);
    expect(filas[0]).toMatchObject({ codigo: 'E01', dia: 1, cuento: 'c1', pregunta: 1, tipo: 'Tema', acierto_primer_intento: true, opciones_tocadas: 'a', mostrada_en: '2026-10-19 09:00:00' });
    const opinion = filas.find((f) => f.es_opinion);
    expect(opinion).toMatchObject({ tipo: 'Lo que te importa a ti', acierto_primer_intento: null, opcion_elegida: 'b' });
    expect(JSON.stringify(filas)).not.toMatch(/"uid"|nombre/);
  });

  it('lecturas y juegos con fecha local de Colombia', () => {
    expect(filasLecturas([estudianteA()])[0]).toEqual({ codigo: 'E01', dia: 1, cuento: 'c1', modo: 'primera', segundos: 120, fecha: '2026-10-19 08:58:00' });
    const [juego] = filasJuegos([estudianteA()]);
    expect(juego).toMatchObject({ codigo: 'E01', juego: 'a-todo-foco', dia: 1, fecha_inicio: '2026-10-19 09:35:00', aciertos: 8, errores: 2, omisiones: 1, tiempo_reaccion_ms: 600 });
  });

  it('el CSV escapa comas y comillas y abre con BOM para Excel y SPSS', () => {
    const csv = aCsv(['a', 'b', 'c'], [{ a: 'x, y', b: 'dijo "hola"', c: true }, { a: null, b: 3.5, c: false }]);
    expect(csv).toBe('﻿a,b,c\r\n"x, y","dijo ""hola""",1\r\n,3.5,0\r\n');
  });
});

describe('formato de tiempo en los paneles', () => {
  it('se lee en minutos y segundos', () => {
    expect(tiempo(221)).toBe('3 min 41 s');
    expect(tiempo(45)).toBe('45 s');
    expect(tiempo(120)).toBe('2 min');
    expect(tiempo(3900)).toBe('1 h 5 min');
    expect(tiempo(null)).toBe(null);
  });
});
