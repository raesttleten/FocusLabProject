import { useEffect, useState } from 'react';
import { ahora } from './reloj.js';

const INTERVALO_MS = 60 * 1000;

export function useAhora() {
  const [momento, setMomento] = useState(ahora);

  useEffect(() => {
    const actualizar = () => setMomento(ahora());
    const intervalo = setInterval(actualizar, INTERVALO_MS);
    document.addEventListener('visibilitychange', actualizar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', actualizar);
    };
  }, []);

  return momento;
}
