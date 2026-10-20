import { aFecha, fechaColombia, ZONA_HORARIA } from '../progreso/fechas.js';

export function duracion(segundos) {
  if (!Number.isFinite(segundos)) return null;
  const total = Math.round(segundos);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const resto = String(total % 60).padStart(2, '0');
  return horas ? `${horas}:${String(minutos).padStart(2, '0')}:${resto}` : `${minutos}:${resto}`;
}

export function porcentaje(valor) {
  return Number.isFinite(valor) ? `${Math.round(valor)} %` : null;
}

export function decimal(valor, digitos = 1) {
  return Number.isFinite(valor) ? valor.toFixed(digitos).replace('.', ',') : null;
}

export function milisegundos(valor) {
  return Number.isFinite(valor) ? `${(valor / 1000).toFixed(2).replace('.', ',')} s` : null;
}

const hora = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA_HORARIA, hour: 'numeric', minute: '2-digit' });
const diaMes = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA_HORARIA, day: 'numeric', month: 'short' });
const fechaLarga = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA_HORARIA, weekday: 'long', day: 'numeric', month: 'long' });

export function momento(valor, ahora) {
  const fecha = aFecha(valor);
  if (!fecha) return null;
  const prefijo = fechaColombia(fecha) === fechaColombia(ahora) ? 'Hoy' : diaMes.format(fecha).replace('.', '');
  return `${prefijo}, ${hora.format(fecha)}`;
}

export function fechaDeHoy(ahora) {
  return fechaLarga.format(ahora);
}
