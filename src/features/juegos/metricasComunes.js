const restar = (a, b) => (a == null || b == null ? null : a - b);

const LECTORES = {
  'a-todo-foco': (m) => ({
    aciertos: m.xTocadas,
    errores: m.toquesOtraLetra,
    omisiones: m.xEscapadas,
    tiempoReaccionMs: m.tiempoReaccionPromedioMs,
  }),
  'repite-el-patron': (m) => ({
    aciertos: m.aciertos,
    errores: m.errores,
    omisiones: null,
    tiempoReaccionMs: null,
  }),
  'sigue-el-punto': (m) => ({
    aciertos: m.rondasAcertadas,
    errores: restar(m.totalRondas, m.rondasAcertadas),
    omisiones: null,
    tiempoReaccionMs: m.tiempoRespuestaPromedioMs,
  }),
  'encuentra-el-par': (m) => ({
    aciertos: m.rondasAcertadas,
    errores: m.toquesErrados,
    omisiones: restar(m.totalRondas, m.rondasAcertadas),
    tiempoReaccionMs: m.tiempoPromedioPorParMs,
  }),
  'semaforo-atento': (m) => ({
    aciertos: m.verdesTocadas,
    errores: m.rojasTocadas,
    omisiones: m.verdesEscapadas,
    tiempoReaccionMs: m.tiempoReaccionPromedioMs,
  }),
  'caza-figuras': (m) => ({
    aciertos: m.estrellasEncontradas,
    errores: m.figurasEquivocadas,
    omisiones: m.estrellasSinEncontrar,
    tiempoReaccionMs: null,
  }),
};

const VACIAS = { aciertos: null, errores: null, omisiones: null, tiempoReaccionMs: null };

export const CLAVES_METRICAS = Object.keys(VACIAS);

export function metricasComunes(partida) {
  const lector = LECTORES[partida?.juego];
  if (!lector || !partida.metricas) return { ...VACIAS };
  const leidas = lector(partida.metricas);
  return Object.fromEntries(CLAVES_METRICAS.map((clave) => [clave, Number.isFinite(leidas[clave]) ? leidas[clave] : null]));
}
