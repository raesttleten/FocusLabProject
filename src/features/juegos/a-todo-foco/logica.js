export const LETRA_OBJETIVO = 'X';
export const TOTAL_LETRAS = 36;
export const TOTAL_OBJETIVOS = 9;
export const MS_LETRA = 1200;
export const MS_VACIO = 300;

const DISTRACTORAS = ['K', 'M', 'P', 'R', 'T', 'L', 'N', 'H', 'S', 'F'];

function enteroAleatorio(maximo, aleatorio) {
  return Math.floor(aleatorio() * maximo);
}

export function crearSecuencia({ total = TOTAL_LETRAS, objetivos = TOTAL_OBJETIVOS, aleatorio = Math.random } = {}) {
  const posiciones = Array.from({ length: total }, (_, i) => i);
  for (let i = posiciones.length - 1; i > 0; i--) {
    const j = enteroAleatorio(i + 1, aleatorio);
    [posiciones[i], posiciones[j]] = [posiciones[j], posiciones[i]];
  }
  const conX = new Set(posiciones.slice(0, objetivos));
  let anterior = null;
  return Array.from({ length: total }, (_, i) => {
    if (conX.has(i)) {
      anterior = LETRA_OBJETIVO;
      return LETRA_OBJETIVO;
    }
    const opciones = DISTRACTORAS.filter((letra) => letra !== anterior);
    anterior = opciones[enteroAleatorio(opciones.length, aleatorio)];
    return anterior;
  });
}

export function registrarToque(toques, indice, msDesdeInicio) {
  if (toques[indice] !== undefined) return toques;
  return { ...toques, [indice]: Math.round(msDesdeInicio) };
}

export function resultadoToque(letra, tocada) {
  if (!tocada) return null;
  return letra === LETRA_OBJETIVO ? 'acierto' : 'error';
}

export function calcularMetricas(secuencia, toques) {
  let xTocadas = 0;
  let xEscapadas = 0;
  let toquesOtraLetra = 0;
  const tiemposReaccionMs = [];
  secuencia.forEach((letra, i) => {
    const tiempo = toques[i];
    if (letra === LETRA_OBJETIVO) {
      if (tiempo === undefined) xEscapadas += 1;
      else {
        xTocadas += 1;
        tiemposReaccionMs.push(tiempo);
      }
    } else if (tiempo !== undefined) {
      toquesOtraLetra += 1;
    }
  });
  const promedio = tiemposReaccionMs.length
    ? Math.round(tiemposReaccionMs.reduce((suma, t) => suma + t, 0) / tiemposReaccionMs.length)
    : null;
  return {
    totalLetras: secuencia.length,
    totalX: secuencia.filter((letra) => letra === LETRA_OBJETIVO).length,
    xTocadas,
    xEscapadas,
    toquesOtraLetra,
    tiempoReaccionPromedioMs: promedio,
    tiemposReaccionMs,
  };
}
