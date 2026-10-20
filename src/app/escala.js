export const DISENO = { ancho: 1536, alto: 1024 };
export const ESCALA_MINIMA = 0.6;
export const ESCALA_MINIMA_PANEL = 0.8;
export const ANCHO_MINIMO = 800;

const redondear = (valor) => Math.round(valor * 1000) / 1000;

export function calcularEscala({ ancho, alto, punteroFino }) {
  if (!punteroFino || ancho <= ANCHO_MINIMO) return 1;
  const escala = Math.min(1, ancho / DISENO.ancho, alto / DISENO.alto);
  return Math.max(ESCALA_MINIMA, redondear(escala));
}

export function calcularEscalaPanel({ ancho, punteroFino }) {
  if (!punteroFino || ancho <= ANCHO_MINIMO) return 1;
  return Math.max(ESCALA_MINIMA_PANEL, redondear(Math.min(1, ancho / DISENO.ancho)));
}

export function iniciarEscala() {
  const puntero = window.matchMedia('(pointer: fine)');
  const aplicar = () => {
    const medidas = { ancho: window.innerWidth, alto: window.innerHeight, punteroFino: puntero.matches };
    document.documentElement.style.setProperty('--escala', String(calcularEscala(medidas)));
    document.documentElement.style.setProperty('--escala-panel', String(calcularEscalaPanel(medidas)));
  };
  aplicar();
  window.addEventListener('resize', aplicar);
  puntero.addEventListener('change', aplicar);
}
