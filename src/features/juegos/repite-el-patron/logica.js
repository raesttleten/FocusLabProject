export const CUADROS = 4;
export const LONGITUD_INICIAL = 3;
export const LONGITUD_MAXIMA = 10;
export const ERRORES_PARA_TERMINAR = 2;

export const FASE = {
  showing: 'mostrando',
  turn: 'turno',
  retry: 'reintento',
  finishedByErrors: 'fin-errores',
  finishedByMax: 'fin-maximo',
};

export function crearSecuencia(longitud, aleatorio = Math.random) {
  const secuencia = [];
  for (let i = 0; i < longitud; i++) {
    const opciones = Array.from({ length: CUADROS }, (_, c) => c).filter((c) => c !== secuencia[i - 1]);
    secuencia.push(opciones[Math.floor(aleatorio() * opciones.length)]);
  }
  return secuencia;
}

export function nuevaPartida(aleatorio = Math.random) {
  return {
    longitud: LONGITUD_INICIAL,
    secuencia: crearSecuencia(LONGITUD_INICIAL, aleatorio),
    paso: 0,
    errores: 0,
    aciertos: 0,
    mejor: 0,
    rondas: [],
    fase: FASE.showing,
  };
}

export function empezarTurno(estado) {
  return { ...estado, fase: FASE.turn, paso: 0 };
}

export function tocarCuadro(estado, cuadro, msTurno, aleatorio = Math.random) {
  if (estado.fase !== FASE.turn) return estado;
  if (cuadro !== estado.secuencia[estado.paso]) {
    const errores = estado.errores + 1;
    const rondas = [...estado.rondas, { longitud: estado.longitud, acertada: false, ms: Math.round(msTurno) }];
    if (errores >= ERRORES_PARA_TERMINAR) return { ...estado, errores, rondas, fase: FASE.finishedByErrors };
    return { ...estado, errores, rondas, fase: FASE.retry, secuencia: crearSecuencia(estado.longitud, aleatorio), paso: 0 };
  }
  const paso = estado.paso + 1;
  if (paso < estado.longitud) return { ...estado, paso };
  const rondas = [...estado.rondas, { longitud: estado.longitud, acertada: true, ms: Math.round(msTurno) }];
  const base = { ...estado, paso, rondas, aciertos: estado.aciertos + 1, mejor: Math.max(estado.mejor, estado.longitud) };
  if (estado.longitud >= LONGITUD_MAXIMA) return { ...base, fase: FASE.finishedByMax };
  const longitud = estado.longitud + 1;
  return { ...base, longitud, secuencia: crearSecuencia(longitud, aleatorio), fase: FASE.showing };
}

export function reintentar(estado) {
  return estado.fase === FASE.retry ? { ...estado, fase: FASE.showing } : estado;
}

export function terminado(estado) {
  return estado.fase === FASE.finishedByErrors || estado.fase === FASE.finishedByMax;
}

export function calcularMetricas(estado) {
  return {
    secuenciaMasLarga: estado.mejor,
    aciertos: estado.aciertos,
    errores: estado.errores,
    rondas: estado.rondas,
  };
}
