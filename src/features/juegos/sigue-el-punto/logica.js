export const TOTAL_PUNTOS = 6;
export const TOTAL_RONDAS = 5;
export const MS_MARCADO = 2000;
export const MS_MOVIMIENTO = 8000;
export const VELOCIDAD = 0.22;
const SEPARACION_MINIMA = 0.22;

export function crearPuntos(aleatorio = Math.random, total = TOTAL_PUNTOS) {
  const puntos = [];
  let intentos = 0;
  while (puntos.length < total) {
    const candidato = { x: aleatorio(), y: aleatorio() };
    intentos += 1;
    const lejos = puntos.every((p) => Math.hypot(p.x - candidato.x, p.y - candidato.y) >= SEPARACION_MINIMA);
    if (lejos || intentos > 500) {
      const angulo = aleatorio() * Math.PI * 2;
      puntos.push({ ...candidato, vx: Math.cos(angulo) * VELOCIDAD, vy: Math.sin(angulo) * VELOCIDAD });
    }
  }
  return puntos;
}

function rebotar(posicion, velocidad) {
  if (posicion < 0) return { posicion: -posicion, velocidad: Math.abs(velocidad) };
  if (posicion > 1) return { posicion: 2 - posicion, velocidad: -Math.abs(velocidad) };
  return { posicion, velocidad };
}

export function moverPuntos(puntos, segundos) {
  return puntos.map((p) => {
    const x = rebotar(p.x + p.vx * segundos, p.vx);
    const y = rebotar(p.y + p.vy * segundos, p.vy);
    return { x: x.posicion, y: y.posicion, vx: x.velocidad, vy: y.velocidad };
  });
}

export function elegirMarcado(aleatorio = Math.random, total = TOTAL_PUNTOS) {
  return Math.floor(aleatorio() * total);
}

export function nivelConcentracion(acertadas) {
  if (acertadas >= 4) return 'Alta';
  if (acertadas >= 2) return 'Media';
  return 'En práctica';
}

export function calcularMetricas(rondas) {
  const acertadas = rondas.filter((r) => r.acertada).length;
  const tiempos = rondas.map((r) => r.ms);
  return {
    totalRondas: rondas.length,
    rondasAcertadas: acertadas,
    tiempoRespuestaPromedioMs: tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : null,
    rondas,
  };
}
