import { getDia } from '../contenido/cuentos.js';
import { CLAVES_METRICAS, metricasComunes } from '../juegos/metricasComunes.js';
import { aFecha, ZONA_HORARIA } from '../progreso/fechas.js';
import { diaDeEstudio, esRespuestaDeOpinion, fueRespondida, numerarIntentos, preguntaDe } from './indicadores.js';

const formatoFechaHora = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function fechaHoraCsv(valor) {
  const fecha = aFecha(valor);
  if (!fecha || Number.isNaN(fecha.getTime())) return '';
  const p = Object.fromEntries(formatoFechaHora.formatToParts(fecha).map(({ type, value }) => [type, value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

function celda(valor) {
  if (valor == null) return '';
  if (typeof valor === 'boolean') return valor ? '1' : '0';
  const texto = String(valor);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function aCsv(columnas, filas) {
  const lineas = [columnas.join(','), ...filas.map((fila) => columnas.map((c) => celda(fila[c])).join(','))];
  return `﻿${lineas.join('\r\n')}\r\n`;
}

export const COLUMNAS_RESPUESTAS = [
  'codigo', 'dia', 'componente', 'cuento', 'pregunta', 'tipo', 'es_opinion', 'intentos',
  'acierto_en_intento', 'acierto_primer_intento', 'segundos_hasta_acertar', 'opciones_tocadas',
  'opcion_elegida', 'completada', 'mostrada_en', 'completada_en',
];

export function filasRespuestas(estudiantes) {
  return estudiantes.flatMap((e) =>
    e.respuestas
      .filter(fueRespondida)
      .sort((a, b) => a.dia - b.dia || a.cuento.localeCompare(b.cuento) || a.indice - b.indice)
      .map((r) => {
        const opinion = esRespuestaDeOpinion(r);
        return {
          codigo: e.codigo,
          dia: r.dia,
          componente: getDia(r.dia)?.componente ?? r.componente,
          cuento: r.cuento,
          pregunta: r.indice + 1,
          tipo: preguntaDe(r)?.tipo ?? r.tipo,
          es_opinion: opinion,
          intentos: r.intentos,
          acierto_en_intento: opinion ? null : r.aciertoEnIntento,
          acierto_primer_intento: opinion || r.completada !== true ? null : r.aciertoEnIntento === 1,
          segundos_hasta_acertar: r.segundosHastaAcertar,
          opciones_tocadas: (r.opcionesTocadas ?? []).map((t) => t.opcion).join(';'),
          opcion_elegida: r.opcionElegida,
          completada: r.completada === true,
          mostrada_en: fechaHoraCsv(r.mostradaEn),
          completada_en: fechaHoraCsv(r.completadaEn),
        };
      }),
  );
}

export const COLUMNAS_LECTURAS = ['codigo', 'dia', 'cuento', 'modo', 'segundos', 'fecha'];

export function filasLecturas(estudiantes) {
  return estudiantes.flatMap((e) =>
    [...e.lecturas]
      .sort((a, b) => (aFecha(a.fecha)?.getTime() ?? 0) - (aFecha(b.fecha)?.getTime() ?? 0))
      .map((l) => ({ codigo: e.codigo, dia: l.dia, cuento: l.cuento, modo: l.modo, segundos: l.segundos, fecha: fechaHoraCsv(l.fecha) })),
  );
}

export const COLUMNAS_JUEGOS = [
  'codigo', 'juego', 'intento', 'primer_intento', 'dia', 'fecha_inicio', 'duracion_segundos',
  'aciertos', 'errores', 'omisiones', 'tiempo_reaccion_ms', 'metricas_json',
];

export function filasJuegos(estudiantes) {
  return estudiantes.flatMap((e) =>
    numerarIntentos(e.juegos)
      .map((j) => {
        const comunes = metricasComunes(j);
        return {
          codigo: e.codigo,
          juego: j.juego,
          intento: j.intento,
          primer_intento: j.intento === 1,
          dia: diaDeEstudio(e.dias, j.fechaInicio),
          fecha_inicio: fechaHoraCsv(j.fechaInicio),
          duracion_segundos: j.duracion,
          ...Object.fromEntries(CLAVES_METRICAS.map((c) => [c === 'tiempoReaccionMs' ? 'tiempo_reaccion_ms' : c, comunes[c]])),
          metricas_json: JSON.stringify(j.metricas ?? {}),
        };
      }),
  );
}

export const ARCHIVOS = [
  { id: 'respuestas', nombre: 'Respuestas', detalle: 'una fila por pregunta respondida', columnas: COLUMNAS_RESPUESTAS, filas: filasRespuestas },
  { id: 'lecturas', nombre: 'Lecturas', detalle: 'una fila por cada vez que leyó un cuento', columnas: COLUMNAS_LECTURAS, filas: filasLecturas },
  { id: 'juegos', nombre: 'Juegos', detalle: 'una fila por partida', columnas: COLUMNAS_JUEGOS, filas: filasJuegos },
];
