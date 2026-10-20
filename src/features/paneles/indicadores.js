import { CUENTO_IDS, DIAS, esOpinion, getDia, getPreguntas } from '../contenido/cuentos.js';
import { CLAVES_METRICAS, metricasComunes } from '../juegos/metricasComunes.js';
import { calcularDiaActual, ESTADO_DIA } from '../progreso/diaActual.js';
import { aFecha, fechaColombia } from '../progreso/fechas.js';
import { ESTADO_CUENTO, ESTADO_REGISTRO } from '../progreso/modelo.js';
import { calcularPuntos } from '../progreso/puntos.js';

export const TODO = 'todo';
export const PERIODOS = [1, 2, 3, TODO];
export const COMPONENTE_CORTO = { 1: 'Tema e idea principal', 2: 'Pistas del autor', 3: 'Resumir' };

export function nombrePeriodo(periodo) {
  return periodo === TODO ? 'Todo' : `Día ${periodo}`;
}

const enPeriodo = (periodo, dia) => periodo === TODO || dia === periodo;

const promedio = (valores) => {
  const validos = valores.filter((v) => Number.isFinite(v));
  return validos.length ? validos.reduce((a, b) => a + b, 0) / validos.length : null;
};

const suma = (valores) => valores.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

export function preguntaDe(respuesta) {
  return getPreguntas(respuesta.cuento, respuesta.dia)?.[respuesta.indice] ?? null;
}

export function esRespuestaDeOpinion(respuesta) {
  const pregunta = preguntaDe(respuesta);
  return pregunta ? esOpinion(pregunta) : respuesta.aciertoEnIntento == null;
}

export function fueRespondida(respuesta) {
  return (respuesta?.intentos ?? 0) > 0;
}

export function diaDeEstudio(dias, fecha) {
  if (!fecha) return null;
  const f = fechaColombia(aFecha(fecha));
  for (const dia of [...DIAS].reverse()) {
    const inicio = dias?.[dia]?.fechaInicio;
    if (inicio && fechaColombia(aFecha(inicio)) <= f) return dia;
  }
  return null;
}

export function filtrarPeriodo(estudiante, periodo) {
  const delDia = (fecha) => enPeriodo(periodo, diaDeEstudio(estudiante.dias, fecha));
  return {
    ...estudiante,
    respuestas: estudiante.respuestas.filter((r) => enPeriodo(periodo, r.dia)),
    lecturas: estudiante.lecturas.filter((l) => enPeriodo(periodo, l.dia)),
    juegos: estudiante.juegos.filter((j) => delDia(j.fechaInicio)),
    actividad: estudiante.actividad.filter((a) => delDia(a.inicio)),
    diasDelPeriodo: periodo === TODO ? DIAS : [periodo],
  };
}

export function aciertosPrimerIntento(respuestas) {
  const evaluables = respuestas.filter((r) => r.completada === true && !esRespuestaDeOpinion(r));
  const aciertos = evaluables.filter((r) => r.aciertoEnIntento === 1).length;
  return {
    aciertos,
    total: evaluables.length,
    porcentaje: evaluables.length ? (aciertos / evaluables.length) * 100 : null,
  };
}

export function promedioIntentos(respuestas) {
  return promedio(respuestas.filter((r) => r.completada === true && !esRespuestaDeOpinion(r)).map((r) => r.intentos));
}

export function aciertosPorComponente(respuestas) {
  return DIAS.map((dia) => ({
    dia,
    componente: getDia(dia).componente,
    ...aciertosPrimerIntento(respuestas.filter((r) => r.dia === dia)),
  }));
}

export function segundosDeLectura(lecturas) {
  return suma(lecturas.map((l) => l.segundos));
}

export function lecturaPorCuento(lecturas) {
  const porCuento = new Map();
  for (const lectura of lecturas) {
    if (lectura.modo !== 'primera') continue;
    const clave = `${lectura.dia}_${lectura.cuento}`;
    porCuento.set(clave, (porCuento.get(clave) ?? 0) + (Number.isFinite(lectura.segundos) ? lectura.segundos : 0));
  }
  return porCuento;
}

export function promedioLecturaPorCuento(listaLecturas) {
  return promedio(listaLecturas.flatMap((lecturas) => [...lecturaPorCuento(lecturas).values()]));
}

export function cuentosTerminados(estudiante, diasDelPeriodo = DIAS) {
  return diasDelPeriodo.reduce(
    (total, dia) => total + CUENTO_IDS.filter((c) => estudiante.dias?.[dia]?.cuentos?.[c] === ESTADO_CUENTO.finished).length,
    0,
  );
}

export function diasTerminados(estudiante, diasDelPeriodo = DIAS) {
  return diasDelPeriodo.filter((dia) => estudiante.dias?.[dia]?.estado === ESTADO_REGISTRO.finished).length;
}

export function fechaFinCuento(estudiante, dia, cuento) {
  if (estudiante.dias?.[dia]?.cuentos?.[cuento] !== ESTADO_CUENTO.finished) return null;
  const fechas = estudiante.respuestas
    .filter((r) => r.dia === dia && r.cuento === cuento && r.completadaEn)
    .map((r) => aFecha(r.completadaEn).getTime());
  return fechas.length ? new Date(Math.max(...fechas)) : null;
}

export function cuentosTerminadosEnFecha(estudiante, fecha) {
  let total = 0;
  for (const dia of DIAS) {
    for (const cuento of CUENTO_IDS) {
      const fin = fechaFinCuento(estudiante, dia, cuento);
      if (fin && fechaColombia(fin) === fecha) total += 1;
    }
  }
  return total;
}

function fechasDeEventos(estudiante) {
  return [
    ...estudiante.actividad.flatMap((a) => [a.inicio, a.fin]),
    ...estudiante.lecturas.map((l) => l.fecha),
    ...estudiante.respuestas.flatMap((r) => [r.mostradaEn, r.completadaEn]),
    ...estudiante.juegos.map((j) => j.fechaInicio),
    ...DIAS.map((dia) => estudiante.dias?.[dia]?.fechaInicio),
  ]
    .map(aFecha)
    .filter((f) => f && !Number.isNaN(f.getTime()));
}

export function ultimoIngreso(estudiante) {
  const fechas = fechasDeEventos(estudiante);
  return fechas.length ? new Date(Math.max(...fechas.map((f) => f.getTime()))) : null;
}

export function activoEnFecha(estudiante, fecha) {
  return fechasDeEventos(estudiante).some((f) => fechaColombia(f) === fecha);
}

export function diaEnQueVa(estudiante, ahora) {
  if (!DIAS.some((dia) => estudiante.dias?.[dia])) return { dia: null, texto: 'Sin empezar', estado: 'sin-empezar' };
  const { dia, estado } = calcularDiaActual(estudiante.dias, ahora);
  if (estado === ESTADO_DIA.allDone || diasTerminados(estudiante) === DIAS.length) {
    return { dia: DIAS.length, texto: 'Terminó', estado: 'termino' };
  }
  return { dia, texto: `Día ${dia}`, estado: 'en-curso' };
}

export function tiempoActividad(actividad) {
  return {
    segundosActivos: suma(actividad.map((a) => a.segundosActivos)),
    segundosInactivos: suma(actividad.map((a) => a.segundosInactivos)),
    salidas: suma(actividad.map((a) => a.salidas)),
  };
}

export function promedioMetricasJuegos(juegos) {
  const metricas = juegos.map(metricasComunes);
  return Object.fromEntries(CLAVES_METRICAS.map((clave) => [clave, promedio(metricas.map((m) => m[clave]))]));
}

export function filaDocente(estudiante, periodo, ahora) {
  const filtrado = filtrarPeriodo(estudiante, periodo);
  return {
    uid: estudiante.uid,
    codigo: estudiante.codigo,
    diaEnQueVa: diaEnQueVa(estudiante, ahora),
    cuentosTerminados: cuentosTerminados(estudiante, filtrado.diasDelPeriodo),
    cuentosPosibles: filtrado.diasDelPeriodo.length * CUENTO_IDS.length,
    puntos: calcularPuntos(filtrado.respuestas),
    primerIntento: aciertosPrimerIntento(filtrado.respuestas),
    segundosLectura: segundosDeLectura(filtrado.lecturas),
    ultimoIngreso: ultimoIngreso(estudiante),
  };
}

export function resumenDocente(estudiantes, periodo, ahora) {
  const hoy = fechaColombia(ahora);
  const filtrados = estudiantes.map((e) => filtrarPeriodo(e, periodo));
  return {
    total: estudiantes.length,
    activosHoy: estudiantes.filter((e) => activoEnFecha(e, hoy)).length,
    cuentosHoy: estudiantes.reduce((t, e) => t + cuentosTerminadosEnFecha(e, hoy), 0),
    cuentosPosiblesHoy: estudiantes.length * CUENTO_IDS.length,
    primerIntento: aciertosPrimerIntento(filtrados.flatMap((e) => e.respuestas)),
    lecturaPromedio: promedioLecturaPorCuento(filtrados.map((e) => e.lecturas)),
  };
}

export function detalleDocente(estudiante) {
  return DIAS.map((dia) => {
    const lecturas = lecturaPorCuento(estudiante.lecturas.filter((l) => l.dia === dia));
    return {
      dia,
      componente: getDia(dia).componente,
      empezado: Boolean(estudiante.dias?.[dia]),
      terminado: estudiante.dias?.[dia]?.estado === ESTADO_REGISTRO.finished,
      cuentos: CUENTO_IDS.map((cuento) => ({
        cuento,
        terminado: estudiante.dias?.[dia]?.cuentos?.[cuento] === ESTADO_CUENTO.finished,
        segundosLectura: lecturas.get(`${dia}_${cuento}`) ?? null,
        preguntas: getPreguntas(cuento, dia).map((pregunta, indice) => {
          const respuesta = estudiante.respuestas.find((r) => r.dia === dia && r.cuento === cuento && r.indice === indice);
          return {
            indice,
            opinion: esOpinion(pregunta),
            intentos: respuesta?.intentos ?? 0,
            completada: respuesta?.completada === true,
          };
        }),
      })),
      juegos: juegosPorNombre(estudiante.juegos.filter((j) => diaDeEstudio(estudiante.dias, j.fechaInicio) === dia)),
    };
  });
}

function juegosPorNombre(juegos) {
  const conteo = new Map();
  for (const partida of juegos) conteo.set(partida.juego, (conteo.get(partida.juego) ?? 0) + 1);
  return [...conteo.entries()].map(([juego, partidas]) => ({ juego, partidas }));
}

export function filaInvestigadora(estudiante, periodo) {
  const filtrado = filtrarPeriodo(estudiante, periodo);
  return {
    uid: estudiante.uid,
    codigo: estudiante.codigo,
    diasTerminados: diasTerminados(estudiante, filtrado.diasDelPeriodo),
    diasPosibles: filtrado.diasDelPeriodo.length,
    porComponente: aciertosPorComponente(filtrado.respuestas),
    primerIntento: aciertosPrimerIntento(filtrado.respuestas),
    promedioIntentos: promedioIntentos(filtrado.respuestas),
    segundosLectura: segundosDeLectura(filtrado.lecturas),
    ...tiempoActividad(filtrado.actividad),
    partidas: filtrado.juegos.length,
    juegos: promedioMetricasJuegos(filtrado.juegos),
  };
}

export function resumenInvestigadora(estudiantes, periodo) {
  const filtrados = estudiantes.map((e) => filtrarPeriodo(e, periodo));
  const respuestas = filtrados.flatMap((e) => e.respuestas);
  return {
    total: estudiantes.length,
    participantes: estudiantes.filter((e) => diasTerminados(e) > 0).length,
    diasCompletados: filtrados.reduce((t, e) => t + diasTerminados(e, e.diasDelPeriodo), 0),
    primerIntento: aciertosPrimerIntento(respuestas),
    porComponente: aciertosPorComponente(estudiantes.flatMap((e) => e.respuestas)),
    lecturaPromedio: promedioLecturaPorCuento(filtrados.map((e) => e.lecturas)),
    ...tiempoActividad(filtrados.flatMap((e) => e.actividad)),
  };
}

export function detalleInvestigadora(estudiante, periodo) {
  const filtrado = filtrarPeriodo(estudiante, periodo);
  const respuestas = filtrado.diasDelPeriodo.flatMap((dia) =>
    CUENTO_IDS.flatMap((cuento) =>
      getPreguntas(cuento, dia).map((pregunta, indice) => {
        const r = filtrado.respuestas.find((x) => x.dia === dia && x.cuento === cuento && x.indice === indice);
        return {
          dia,
          cuento,
          indice,
          tipo: pregunta.tipo,
          componente: getDia(dia).componente,
          opinion: esOpinion(pregunta),
          intentos: r?.intentos ?? 0,
          aciertoEnIntento: r?.aciertoEnIntento ?? null,
          segundosHastaAcertar: r?.segundosHastaAcertar ?? null,
          opciones: (r?.opcionesTocadas ?? []).map((t) => t.opcion),
          opcionElegida: r?.opcionElegida ?? null,
          completada: r?.completada === true,
        };
      }),
    ),
  );
  return { fila: filaInvestigadora(estudiante, periodo), respuestas, juegos: filtrado.juegos };
}
