import { useCallback, useEffect, useRef, useState } from 'react';

function visible() {
  return document.visibilityState === 'visible';
}

export function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}

export function useCronometroVisible() {
  const acumulado = useRef(0);
  const desde = useRef(visible() ? performance.now() : null);
  const [segundos, setSegundos] = useState(0);

  const leer = useCallback(() => {
    const enCurso = desde.current === null ? 0 : performance.now() - desde.current;
    return Math.floor((acumulado.current + enCurso) / 1000);
  }, []);

  useEffect(() => {
    const alCambiar = () => {
      if (visible()) {
        if (desde.current === null) desde.current = performance.now();
      } else if (desde.current !== null) {
        acumulado.current += performance.now() - desde.current;
        desde.current = null;
      }
      setSegundos(leer());
    };
    const intervalo = setInterval(() => setSegundos(leer()), 1000);
    document.addEventListener('visibilitychange', alCambiar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alCambiar);
    };
  }, [leer]);

  return { segundos, leer };
}
