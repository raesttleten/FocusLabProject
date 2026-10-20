export const DISENO = { ancho: 1536, alto: 1024 };
export const ESCALA_MINIMA = 0.6;
export const ANCHO_MINIMO = 800;

export function calcularEscala({ ancho, alto, punteroFino }) {
  if (!punteroFino || ancho <= ANCHO_MINIMO) return 1;
  const escala = Math.min(1, ancho / DISENO.ancho, alto / DISENO.alto);
  return Math.max(ESCALA_MINIMA, Math.round(escala * 1000) / 1000);
}

export function iniciarEscala() {
  const puntero = window.matchMedia('(pointer: fine)');
  const aplicar = () => {
    const escala = calcularEscala({ ancho: window.innerWidth, alto: window.innerHeight, punteroFino: puntero.matches });
    document.documentElement.style.setProperty('--escala', String(escala));
  };
  aplicar();
  window.addEventListener('resize', aplicar);
  puntero.addEventListener('change', aplicar);
}
