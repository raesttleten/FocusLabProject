export const TOTAL_LUCES = 10;
export const TOTAL_VERDES = 6;
export const MS_LUZ = 1300;
export const MS_APAGADA = 200;
export const VERDE = 'verde';
export const ROJA = 'roja';

export function crearSecuencia(aleatorio = Math.random) {
  const luces = [...Array(TOTAL_VERDES).fill(VERDE), ...Array(TOTAL_LUCES - TOTAL_VERDES).fill(ROJA)];
  for (let i = luces.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [luces[i], luces[j]] = [luces[j], luces[i]];
  }
  return luces;
}

export function registrarToque(toques, indice, ms) {
  if (toques[indice] !== undefined) return toques;
  return { ...toques, [indice]: Math.round(ms) };
}

export function calcularMetricas(secuencia, toques) {
  let verdesTocadas = 0;
  let verdesEscapadas = 0;
  let rojasTocadas = 0;
  const tiemposReaccionMs = [];
  secuencia.forEach((luz, i) => {
    const tiempo = toques[i];
    if (luz === VERDE) {
      if (tiempo === undefined) verdesEscapadas += 1;
      else {
        verdesTocadas += 1;
        tiemposReaccionMs.push(tiempo);
      }
    } else if (tiempo !== undefined) {
      rojasTocadas += 1;
    }
  });
  return {
    totalLuces: secuencia.length,
    totalVerdes: secuencia.filter((luz) => luz === VERDE).length,
    verdesTocadas,
    verdesEscapadas,
    rojasTocadas,
    tiempoReaccionPromedioMs: tiemposReaccionMs.length
      ? Math.round(tiemposReaccionMs.reduce((a, b) => a + b, 0) / tiemposReaccionMs.length)
      : null,
    tiemposReaccionMs,
  };
}
