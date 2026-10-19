export const FORMAS = ['circulo', 'cuadrado', 'triangulo', 'rombo'];
export const TONOS = [1, 0.55, 0.25];
export const TOTAL_FIGURAS = 12;
export const TOTAL_RONDAS = 5;
export const ERRORES_POR_RONDA = 3;

export const EVENTO = {
  selected: 'seleccion',
  unselected: 'deseleccion',
  found: 'acierto',
  wrong: 'error',
  lost: 'fallida',
  ignored: 'ignorado',
};

function barajar(lista, aleatorio) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function crearRonda(aleatorio = Math.random) {
  const combinaciones = FORMAS.flatMap((forma) => TONOS.map((tono) => ({ forma, tono })));
  const elegidas = barajar(combinaciones, aleatorio).slice(0, TOTAL_FIGURAS - 1);
  const repetida = elegidas[Math.floor(aleatorio() * elegidas.length)];
  const figuras = barajar([...elegidas, { ...repetida }], aleatorio);
  const par = figuras
    .map((f, i) => (f.forma === repetida.forma && f.tono === repetida.tono ? i : -1))
    .filter((i) => i >= 0);
  return { figuras, par };
}

export function sonIguales(a, b) {
  return a.forma === b.forma && a.tono === b.tono;
}

export function estadoInicial() {
  return { seleccion: null, errores: 0, terminada: false, acertada: false };
}

export function elegir(estado, ronda, indice) {
  if (estado.terminada) return { estado, evento: EVENTO.ignored };
  if (estado.seleccion === null) return { estado: { ...estado, seleccion: indice }, evento: EVENTO.selected };
  if (estado.seleccion === indice) return { estado: { ...estado, seleccion: null }, evento: EVENTO.unselected };
  if (sonIguales(ronda.figuras[estado.seleccion], ronda.figuras[indice])) {
    return { estado: { ...estado, seleccion: null, terminada: true, acertada: true }, evento: EVENTO.found };
  }
  const errores = estado.errores + 1;
  if (errores >= ERRORES_POR_RONDA) {
    return { estado: { ...estado, seleccion: null, errores, terminada: true, acertada: false }, evento: EVENTO.lost };
  }
  return { estado: { ...estado, seleccion: null, errores }, evento: EVENTO.wrong };
}

export function calcularMetricas(rondas) {
  const encontradas = rondas.filter((r) => r.acertada);
  return {
    totalRondas: rondas.length,
    rondasAcertadas: encontradas.length,
    toquesErrados: rondas.reduce((suma, r) => suma + r.errores, 0),
    tiempoPromedioPorParMs: encontradas.length
      ? Math.round(encontradas.reduce((suma, r) => suma + r.ms, 0) / encontradas.length)
      : null,
    rondas,
  };
}

export function formatearSegundos(ms) {
  if (ms === null) return 'Sin pares';
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}
