import { DIAS } from '../contenido/cuentos.js';
import { aFecha, fechaColombia } from './fechas.js';

export const ESTADO_DIA = {
  inProgress: 'en-curso',
  finishedToday: 'terminado-hoy',
  allDone: 'completo',
};

function estaTerminado(registro) {
  return registro?.estado === 'terminado' && registro.fechaFin != null;
}

export function calcularDiaActual(dias, ahora) {
  const hoy = fechaColombia(ahora);
  for (const dia of DIAS) {
    const registro = dias?.[dia];
    if (!estaTerminado(registro)) return { dia, estado: ESTADO_DIA.inProgress };
    if (hoy <= fechaColombia(aFecha(registro.fechaFin))) {
      return { dia, estado: ESTADO_DIA.finishedToday };
    }
  }
  return { dia: DIAS.at(-1), estado: ESTADO_DIA.allDone };
}
