import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider.jsx';
import { avanzar, crearContador, interactuar, mostrar, ocultar, resumenActividad } from './actividad.js';
import { ahora } from './reloj.js';
import { guardarActividad, nuevoTramoId } from './repositorio.js';

const MS_GUARDADO = 30 * 1000;
const EVENTOS_INTERACCION = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

export function useRegistroActividad() {
  const { profile, alCerrarSesion } = useAuth();
  const uid = profile?.uid;

  useEffect(() => {
    if (!uid) return undefined;
    const tramoId = nuevoTramoId();
    const inicio = ahora();
    const reloj = () => performance.now();
    const inicioMs = reloj();
    let contador = crearContador(inicioMs, document.visibilityState === 'visible');
    let ultimoGuardadoMs = -Infinity;

    function guardar() {
      contador = avanzar(contador, reloj());
      const fin = new Date(inicio.getTime() + (contador.ultimoCorte - inicioMs));
      guardarActividad(uid, tramoId, { inicio, fin, ...resumenActividad(contador) });
      ultimoGuardadoMs = reloj();
    }

    function alInteractuar() {
      if (document.visibilityState !== 'visible') return;
      contador = interactuar(contador, reloj());
    }

    function alCambiarVisibilidad() {
      if (document.visibilityState === 'visible') {
        contador = mostrar(contador, reloj());
      } else {
        contador = ocultar(contador, reloj());
        guardar();
      }
    }

    const opciones = { capture: true, passive: true };
    EVENTOS_INTERACCION.forEach((evento) => window.addEventListener(evento, alInteractuar, opciones));
    window.addEventListener('scroll', alInteractuar, opciones);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('pagehide', guardar);
    const intervalo = setInterval(() => {
      if (reloj() - ultimoGuardadoMs >= MS_GUARDADO - 50) guardar();
    }, MS_GUARDADO);
    const dejarCierre = alCerrarSesion(guardar);

    return () => {
      EVENTOS_INTERACCION.forEach((evento) => window.removeEventListener(evento, alInteractuar, opciones));
      window.removeEventListener('scroll', alInteractuar, opciones);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('pagehide', guardar);
      clearInterval(intervalo);
      dejarCierre();
    };
  }, [uid, alCerrarSesion]);
}
