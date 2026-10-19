export const JUEGOS = [
  { id: 'a-todo-foco', nombre: 'A Todo Foco', habilidad: 'Atención sostenida', umbral: 20, dia: 1 },
  { id: 'repite-el-patron', nombre: 'Repite el Patrón', habilidad: 'Memoria de trabajo', umbral: 40, dia: 1 },
  { id: 'sigue-el-punto', nombre: 'Sigue el Punto', habilidad: 'Seguimiento visual', umbral: 70, dia: 2 },
  { id: 'encuentra-el-par', nombre: 'Encuentra el Par', habilidad: 'Atención selectiva', umbral: 100, dia: 2 },
  { id: 'semaforo-atento', nombre: 'Semáforo Atento', habilidad: 'Atención e inhibición', umbral: 130, dia: 3 },
  { id: 'caza-figuras', nombre: 'Caza Figuras', habilidad: 'Atención selectiva', umbral: 160, dia: 3 },
];

export function getJuego(id) {
  return JUEGOS.find((juego) => juego.id === id);
}

export function juegosDelDia(dia) {
  return JUEGOS.filter((juego) => juego.dia === dia);
}

export function estaDesbloqueado(juego, puntosTotales) {
  return puntosTotales >= juego.umbral;
}

export function juegosRecienDesbloqueados(puntosAntes, puntosDespues) {
  return JUEGOS.filter((juego) => puntosAntes < juego.umbral && puntosDespues >= juego.umbral);
}
