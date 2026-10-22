import { DIAS } from '../contenido/cuentos.js';
import { aFecha, fechaColombia } from './fechas.js';

export const ESTADO_DIA = {
  inProgress: 'en-curso',
  finishedToday: 'terminado-hoy',
  allDone: 'completo',
};

export const FECHAS_PILOTO = ['2026-10-20', '2026-10-21', '2026-10-22'];

function estaTerminado(registro) {
  return registro?.estado === 'terminado' && registro.fechaFin != null;
}

export function diaDelCalendario(hoy, fechas = FECHAS_PILOTO) {
  const alcanzados = fechas.filter((fecha) => fecha <= hoy).length;
  return Math.min(Math.max(alcanzados, 1), DIAS.length);
}

export function calcularDiaActual(dias, ahora, fechas = FECHAS_PILOTO) {
  const hoy = fechaColombia(ahora);
  const diaCalendario = diaDelCalendario(hoy, fechas);
  for (const dia of DIAS) {
    const registro = dias?.[dia];
    if (!estaTerminado(registro)) {
      if (dia < diaCalendario) continue;
      return { dia, estado: ESTADO_DIA.inProgress };
    }
    if (dia >= diaCalendario && hoy <= fechaColombia(aFecha(registro.fechaFin))) {
      return { dia, estado: ESTADO_DIA.finishedToday };
    }
  }
  return { dia: DIAS.at(-1), estado: ESTADO_DIA.allDone };
}
