export const MS_SIN_INTERACCION = 60 * 1000;
export const MS_SALIDA = 5 * 60 * 1000;

export function crearContador(ahoraMs, visible = true) {
  return {
    ultimoCorte: ahoraMs,
    ultimaInteraccion: ahoraMs,
    visible,
    ocultaDesde: visible ? null : ahoraMs,
    activoMs: 0,
    inactivoMs: 0,
    salidas: 0,
  };
}

export function avanzar(contador, ahoraMs) {
  const desde = contador.ultimoCorte;
  if (ahoraMs <= desde) return contador;
  let activo = 0;
  if (contador.visible) {
    const finActivo = Math.min(ahoraMs, contador.ultimaInteraccion + MS_SIN_INTERACCION);
    activo = Math.max(0, finActivo - desde);
  }
  const transcurrido = ahoraMs - desde;
  return {
    ...contador,
    ultimoCorte: ahoraMs,
    activoMs: contador.activoMs + activo,
    inactivoMs: contador.inactivoMs + (transcurrido - activo),
  };
}

export function interactuar(contador, ahoraMs) {
  return { ...avanzar(contador, ahoraMs), ultimaInteraccion: ahoraMs };
}

export function ocultar(contador, ahoraMs) {
  if (!contador.visible) return avanzar(contador, ahoraMs);
  return { ...avanzar(contador, ahoraMs), visible: false, ocultaDesde: ahoraMs };
}

export function mostrar(contador, ahoraMs) {
  if (contador.visible) return interactuar(contador, ahoraMs);
  const avanzado = avanzar(contador, ahoraMs);
  const salio = ahoraMs - contador.ocultaDesde > MS_SALIDA;
  return {
    ...avanzado,
    visible: true,
    ocultaDesde: null,
    ultimaInteraccion: ahoraMs,
    salidas: avanzado.salidas + (salio ? 1 : 0),
  };
}

export function resumenActividad(contador) {
  return {
    segundosActivos: Math.round(contador.activoMs / 1000),
    segundosInactivos: Math.round(contador.inactivoMs / 1000),
    salidas: contador.salidas,
  };
}
