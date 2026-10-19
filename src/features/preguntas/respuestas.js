import { getDia, esOpinion } from '../contenido/cuentos.js';
import { aFecha } from '../progreso/fechas.js';

export const LETRAS = ['a', 'b', 'c', 'd'];

export const RESULTADO = {
  correct: 'correcta',
  wrong: 'incorrecta',
  opinion: 'opinion',
};

function segundosDesde(inicio, hora) {
  const desde = aFecha(inicio);
  if (!desde) return null;
  return Math.max(0, Math.round((hora.getTime() - desde.getTime()) / 1000));
}

export function respuestaInicial({ dia, cuentoId, indice, pregunta, hora }) {
  return {
    dia,
    cuento: cuentoId,
    indice,
    tipo: pregunta.tipo,
    componente: getDia(dia).componente,
    intentos: 0,
    opcionesTocadas: [],
    completada: false,
    mostradaEn: hora,
  };
}

export function aplicarToque(respuesta, pregunta, indiceOpcion, hora) {
  if (respuesta.completada) return respuesta;
  const letra = LETRAS[indiceOpcion];
  const intentos = respuesta.intentos + 1;
  const tocada = {
    ...respuesta,
    intentos,
    opcionesTocadas: [...respuesta.opcionesTocadas, { opcion: letra, hora }],
  };
  if (esOpinion(pregunta)) return { ...tocada, opcionElegida: letra };
  if (indiceOpcion !== pregunta.correcta) return tocada;
  return {
    ...tocada,
    completada: true,
    aciertoEnIntento: intentos,
    segundosHastaAcertar: segundosDesde(respuesta.mostradaEn, hora),
    completadaEn: hora,
  };
}

export function confirmarOpinion(respuesta, hora) {
  if (respuesta.completada || !respuesta.opcionElegida) return respuesta;
  return {
    ...respuesta,
    completada: true,
    segundosHastaAcertar: segundosDesde(respuesta.mostradaEn, hora),
    completadaEn: hora,
  };
}

export function estadoVisual(respuesta, pregunta) {
  const ultima = respuesta?.opcionesTocadas?.at(-1)?.opcion;
  const seleccion = ultima ? LETRAS.indexOf(ultima) : null;
  let resultado = null;
  if (seleccion !== null) {
    if (esOpinion(pregunta)) resultado = RESULTADO.opinion;
    else resultado = respuesta.completada ? RESULTADO.correct : RESULTADO.wrong;
  }
  return {
    seleccion,
    resultado,
    bloqueada: Boolean(respuesta?.completada) && !esOpinion(pregunta),
    puedeAvanzar: Boolean(respuesta?.completada) || resultado === RESULTADO.opinion,
  };
}

export function indiceInicial({ preguntas, respuestasDelCuento, guardada }) {
  const primeraPendiente = preguntas.findIndex((_, i) => !respuestasDelCuento[i]?.completada);
  const tope = primeraPendiente === -1 ? preguntas.length - 1 : primeraPendiente;
  if (Number.isInteger(guardada) && guardada >= 0) return Math.min(guardada, tope);
  return tope;
}
