export const COLUMNAS = 8;
export const FILAS = 4;
export const TOTAL_ESTRELLAS = 12;
export const ESTRELLA = 'estrella';
export const OTRAS = ['circulo', 'triangulo', 'cuadrado'];

export function crearTablero(aleatorio = Math.random) {
  const total = COLUMNAS * FILAS;
  const otras = Array.from({ length: total - TOTAL_ESTRELLAS }, (_, i) => OTRAS[i % OTRAS.length]);
  const figuras = [...Array(TOTAL_ESTRELLAS).fill(ESTRELLA), ...otras];
  for (let i = figuras.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [figuras[i], figuras[j]] = [figuras[j], figuras[i]];
  }
  return figuras;
}

export function estadoInicial() {
  return { tocadas: {}, encontradas: 0, equivocadas: 0 };
}

export function tocarCelda(estado, figuras, indice, ms) {
  if (estado.tocadas[indice] !== undefined) return estado;
  const esEstrella = figuras[indice] === ESTRELLA;
  return {
    tocadas: { ...estado.tocadas, [indice]: Math.round(ms) },
    encontradas: estado.encontradas + (esEstrella ? 1 : 0),
    equivocadas: estado.equivocadas + (esEstrella ? 0 : 1),
  };
}

export function todasEncontradas(estado) {
  return estado.encontradas >= TOTAL_ESTRELLAS;
}

export function calcularMetricas(estado, figuras, tiempoTotalMs) {
  return {
    totalEstrellas: figuras.filter((f) => f === ESTRELLA).length,
    estrellasEncontradas: estado.encontradas,
    estrellasSinEncontrar: TOTAL_ESTRELLAS - estado.encontradas,
    figurasEquivocadas: estado.equivocadas,
    tiempoTotalMs: Math.round(tiempoTotalMs),
    terminoPor: todasEncontradas(estado) ? 'todas' : 'boton',
    toques: Object.entries(estado.tocadas)
      .map(([indice, ms]) => ({ figura: figuras[indice], ms }))
      .sort((a, b) => a.ms - b.ms),
  };
}
