import { desplazarAFecha } from './fechas.js';

const CLAVE_FECHA_SIMULADA = 'focuslap-fecha-simulada';
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function fechaSimuladaDesarrollo() {
  try {
    const parametro = new URLSearchParams(window.location.search).get('fecha');
    if (parametro !== null) {
      if (FORMATO_FECHA.test(parametro)) sessionStorage.setItem(CLAVE_FECHA_SIMULADA, parametro);
      else sessionStorage.removeItem(CLAVE_FECHA_SIMULADA);
    }
    return sessionStorage.getItem(CLAVE_FECHA_SIMULADA);
  } catch {
    return null;
  }
}

export function ahora() {
  const real = new Date();
  if (import.meta.env.DEV) {
    const simulada = fechaSimuladaDesarrollo();
    if (simulada) return desplazarAFecha(real, simulada);
  }
  return real;
}
