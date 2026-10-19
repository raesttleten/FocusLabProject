export const ZONA_HORARIA = 'America/Bogota';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const formato = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function aFecha(valor) {
  if (valor == null) return null;
  if (valor instanceof Date) return valor;
  if (typeof valor.toDate === 'function') return valor.toDate();
  return new Date(valor);
}

export function fechaColombia(fecha) {
  const partes = Object.fromEntries(
    formato.formatToParts(aFecha(fecha)).map(({ type, value }) => [type, value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}

export function diasEntre(desde, hasta) {
  const [a1, m1, d1] = desde.split('-').map(Number);
  const [a2, m2, d2] = hasta.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / MS_POR_DIA);
}

export function desplazarAFecha(real, fecha) {
  return new Date(real.getTime() + diasEntre(fechaColombia(real), fecha) * MS_POR_DIA);
}
