import { CUENTO_IDS } from '../contenido/cuentos.js';
import { JUEGOS, estaDesbloqueado } from '../juegos/catalogo.js';
import { calcularDiaActual, ESTADO_DIA } from './diaActual.js';
import { fechaColombia } from './fechas.js';
import { calcularPuntos, calcularPuntosDeHoy, completadaEnFecha } from './puntos.js';

export const ESTADO_REGISTRO = {
  locked: 'bloqueado',
  available: 'disponible',
  finished: 'terminado',
};

export const ESTADO_CUENTO = {
  pending: 'pendiente',
  finished: 'terminado',
};

export function nuevoRegistroDia(fecha) {
  return {
    estado: ESTADO_REGISTRO.available,
    fechaInicio: fecha,
    fechaFin: null,
    transicionMostrada: null,
    cuentos: Object.fromEntries(CUENTO_IDS.map((id) => [id, ESTADO_CUENTO.pending])),
    preguntaActual: null,
  };
}

export function registroTrasTerminarCuento(registro, cuentoId, fecha) {
  const base = registro ?? nuevoRegistroDia(fecha);
  const cuentos = { ...base.cuentos, [cuentoId]: ESTADO_CUENTO.finished };
  const diaTerminado = CUENTO_IDS.every((id) => cuentos[id] === ESTADO_CUENTO.finished);
  return {
    ...base,
    cuentos,
    preguntaActual: null,
    estado: diaTerminado ? ESTADO_REGISTRO.finished : base.estado,
    fechaFin: diaTerminado ? base.fechaFin ?? fecha : base.fechaFin,
  };
}

export function cuentosTerminados(registro) {
  return CUENTO_IDS.filter((id) => registro?.cuentos?.[id] === ESTADO_CUENTO.finished);
}

export function debeMostrarTransicion({ respuestas, cuentoId, registro, ahora }) {
  const hoy = fechaColombia(ahora);
  if (registro?.transicionMostrada === hoy) return false;
  const puntosDeHoyAntes = calcularPuntos(
    respuestas.filter((respuesta) => respuesta.cuento !== cuentoId && completadaEnFecha(respuesta, hoy)),
  );
  return puntosDeHoyAntes === 0;
}

export function resumirProgreso(dias, respuestas, ahora) {
  const diaActual = calcularDiaActual(dias, ahora);
  const puntosTotales = calcularPuntos(respuestas);
  return {
    diaActual,
    registroDia: dias?.[diaActual.dia] ?? null,
    puntosTotales,
    puntosHoy: calcularPuntosDeHoy(respuestas, ahora),
    juegosAbiertos: JUEGOS.filter((juego) => estaDesbloqueado(juego, puntosTotales)).map((juego) => juego.id),
    todoTerminado: diaActual.estado === ESTADO_DIA.allDone,
  };
}
