import { PUNTOS_POR_RESPUESTA, respuestaId } from '../contenido/cuentos.js';
import { aFecha, fechaColombia } from './fechas.js';

function respuestasCompletadasUnicas(respuestas) {
  const ids = new Set();
  for (const respuesta of respuestas) {
    if (respuesta?.completada === true) {
      ids.add(respuestaId(respuesta.dia, respuesta.cuento, respuesta.indice));
    }
  }
  return ids;
}

export function calcularPuntos(respuestas) {
  return respuestasCompletadasUnicas(respuestas).size * PUNTOS_POR_RESPUESTA;
}

export function calcularPuntosDelDia(respuestas, dia) {
  return calcularPuntos(respuestas.filter((respuesta) => respuesta?.dia === dia));
}

export function completadaEnFecha(respuesta, fecha) {
  return respuesta?.completadaEn != null && fechaColombia(aFecha(respuesta.completadaEn)) === fecha;
}

export function calcularPuntosDeHoy(respuestas, ahora) {
  const hoy = fechaColombia(ahora);
  return calcularPuntos(respuestas.filter((respuesta) => completadaEnFecha(respuesta, hoy)));
}
