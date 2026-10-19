import { useEffect, useRef, useState } from 'react';
import {
  calcularMetricas,
  CUADROS,
  empezarTurno,
  FASE,
  nuevaPartida,
  reintentar,
  terminado,
  tocarCuadro,
} from './logica.js';
import './RepiteElPatron.css';

const MS_ANTES = 800;
const MS_LUZ = 600;
const MS_ENTRE = 250;
const MS_ECO = 250;
const MS_REINTENTO = 1600;
const NOMBRES = ['azul', 'verde', 'amarillo', 'rosado'];

export const instrucciones = {
  vista: (
    <div className="rep-mini">
      {NOMBRES.map((nombre) => (
        <span key={nombre} className={`rep-mini__cuadro rep-cuadro--${nombre}`} />
      ))}
    </div>
  ),
  texto: 'Se iluminarán los cuadros en un orden. Cuando terminen, tócalos en el mismo orden. Cada ronda suma un cuadro más.',
  detalle: 'Termina al segundo error',
};

export function resultados(metricas) {
  return {
    titulo: '¡Gran memoria!',
    metricas: [
      { valor: String(metricas.secuenciaMasLarga), etiqueta: 'colores seguidos que recordaste' },
      { valor: String(metricas.aciertos), etiqueta: 'rondas completadas' },
    ],
  };
}

function titulo(estado, ronda) {
  switch (estado.fase) {
    case FASE.turn:
      return `Ronda ${ronda}: tu turno`;
    case FASE.retry:
      return 'Ups, ese no era. ¡Vamos otra vez!';
    case FASE.finishedByErrors:
      return 'Ups, ese no era. ¡Buen intento!';
    case FASE.finishedByMax:
      return `¡Completaste las ${estado.aciertos} rondas!`;
    default:
      return `Ronda ${ronda}: mira el patrón`;
  }
}

export function Jugando({ onTerminar }) {
  const [estado, setEstado] = useState(() => nuevaPartida());
  const [encendido, setEncendido] = useState(null);
  const [eco, setEco] = useState(null);
  const inicioTurno = useRef(0);
  const ronda = estado.rondas.length + 1;

  useEffect(() => {
    if (estado.fase === FASE.retry) {
      const id = setTimeout(() => setEstado((actual) => reintentar(actual)), MS_REINTENTO);
      return () => clearTimeout(id);
    }
    if (estado.fase !== FASE.showing) return undefined;
    const tiempos = [];
    let t = MS_ANTES;
    estado.secuencia.forEach((cuadro) => {
      tiempos.push(setTimeout(() => setEncendido(cuadro), t));
      t += MS_LUZ;
      tiempos.push(setTimeout(() => setEncendido(null), t));
      t += MS_ENTRE;
    });
    tiempos.push(
      setTimeout(() => {
        inicioTurno.current = performance.now();
        setEstado((actual) => empezarTurno(actual));
      }, t),
    );
    return () => tiempos.forEach(clearTimeout);
  }, [estado.fase, estado.secuencia]);

  useEffect(() => {
    if (eco === null) return undefined;
    const id = setTimeout(() => setEco(null), MS_ECO);
    return () => clearTimeout(id);
  }, [eco]);

  function tocar(cuadro) {
    if (estado.fase !== FASE.turn) return;
    setEco(cuadro);
    setEstado(tocarCuadro(estado, cuadro, performance.now() - inicioTurno.current));
  }

  const enTurno = estado.fase === FASE.turn;
  const fin = terminado(estado);

  return (
    <div className="rep-juego">
      <h2 className="rep-titulo" aria-live="polite">
        {titulo(estado, ronda)}
      </h2>
      <div className="rep-tablero" role="group" aria-label="Cuadros">
        {Array.from({ length: CUADROS }, (_, cuadro) => {
          const brillando = encendido === cuadro || (enTurno && eco === cuadro);
          return (
            <button
              key={cuadro}
              type="button"
              className={`rep-cuadro rep-cuadro--${NOMBRES[cuadro]}${brillando ? ' rep-cuadro--encendido' : ''}`}
              aria-label={`Cuadro ${NOMBRES[cuadro]}`}
              aria-disabled={!enTurno}
              data-cuadro={cuadro}
              onClick={() => tocar(cuadro)}
            />
          );
        })}
      </div>
      {enTurno && (
        <div className="rep-pasos" aria-label={`${estado.paso} de ${estado.longitud}`}>
          {estado.secuencia.map((_, i) => (
            <span key={i} className={`rep-paso${i < estado.paso ? ' rep-paso--hecho' : ''}`} />
          ))}
        </div>
      )}
      {fin ? (
        <button type="button" className="student-button rep-ver" onClick={() => onTerminar(calcularMetricas(estado))}>
          Ver resultados
        </button>
      ) : (
        <p className="rep-ayuda">{enTurno ? 'Toca los cuadros en el mismo orden' : 'Mira con atención'}</p>
      )}
    </div>
  );
}
