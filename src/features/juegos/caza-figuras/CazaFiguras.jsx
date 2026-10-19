import { useEffect, useRef, useState } from 'react';
import { calcularMetricas, COLUMNAS, crearTablero, ESTRELLA, estadoInicial, tocarCelda, todasEncontradas, TOTAL_ESTRELLAS } from './logica.js';
import './CazaFiguras.css';

const MS_FINAL = 700;

function Figura({ figura }) {
  return (
    <svg className="caf-figura" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      {figura === 'estrella' && (
        <path d="M36 19L40.4966 29.811L52.168 30.7467L43.2756 38.364L45.9923 49.7533L36 43.65L26.0077 49.7533L28.7244 38.364L19.832 30.7467L31.5034 29.811L36 19Z" />
      )}
      {figura === 'circulo' && <circle cx="36" cy="36" r="17" />}
      {figura === 'triangulo' && <path d="M36 19L50.7224 44.5H21.2776L36 19Z" />}
      {figura === 'cuadrado' && <rect x="19" y="19" width="34" height="34" rx="4" />}
    </svg>
  );
}

export const instrucciones = {
  vista: (
    <div className="caf-vista">
      {['circulo', 'estrella', 'triangulo'].map((figura) => (
        <span key={figura} className="caf-celda">
          <Figura figura={figura} />
        </span>
      ))}
    </div>
  ),
  texto: 'Verás muchas figuras juntas. Busca y toca solo las estrellas. Si tocas otra figura, se marca en rosado y puedes seguir.',
  detalle: `${TOTAL_ESTRELLAS} estrellas escondidas`,
};

export function resultados(metricas) {
  const cazador = metricas.estrellasSinEncontrar === 0 && metricas.figurasEquivocadas <= 1;
  return {
    titulo: cazador ? '¡Gran cazador!' : '¡Buen trabajo!',
    metricas: [
      { valor: `${metricas.estrellasEncontradas} / ${metricas.totalEstrellas}`, etiqueta: 'estrellas encontradas' },
      { valor: String(metricas.estrellasSinEncontrar), etiqueta: 'estrellas sin encontrar' },
      { valor: String(metricas.figurasEquivocadas), etiqueta: 'figuras equivocadas' },
      { valor: `${Math.round(metricas.tiempoTotalMs / 1000)} s`, etiqueta: 'tiempo total' },
    ],
  };
}

export function Jugando({ onTerminar }) {
  const [figuras] = useState(() => crearTablero());
  const [estado, setEstado] = useState(estadoInicial);
  const inicio = useRef(performance.now());
  const terminado = useRef(false);
  const fin = useRef(null);

  function terminar(final) {
    if (terminado.current) return;
    terminado.current = true;
    onTerminar(calcularMetricas(final, figuras, (fin.current ?? performance.now()) - inicio.current));
  }

  useEffect(() => {
    if (!todasEncontradas(estado)) return undefined;
    const id = setTimeout(() => terminar(estado), MS_FINAL);
    return () => clearTimeout(id);
  }, [estado]);

  function tocar(indice) {
    if (todasEncontradas(estado)) return;
    const ahora = performance.now();
    const siguiente = tocarCelda(estado, figuras, indice, ahora - inicio.current);
    if (todasEncontradas(siguiente)) fin.current = ahora;
    setEstado(siguiente);
  }

  return (
    <div className="caf-juego">
      <h2 className="caf-titulo">Toca todas las estrellas. Hay {TOTAL_ESTRELLAS} escondidas.</h2>
      <div className="caf-tablero" style={{ gridTemplateColumns: `repeat(${COLUMNAS}, 72px)` }} role="group" aria-label="Figuras">
        {figuras.map((figura, i) => {
          const tocada = estado.tocadas[i] !== undefined;
          const clase = tocada ? (figura === ESTRELLA ? ' caf-celda--acierto' : ' caf-celda--error') : '';
          return (
            <button
              key={i}
              type="button"
              className={`caf-celda${clase}`}
              aria-label={`Figura ${i + 1}`}
              aria-pressed={tocada}
              data-figura={figura}
              onClick={() => tocar(i)}
            >
              <Figura figura={figura} />
            </button>
          );
        })}
      </div>
      <p className="caf-contador" aria-live="polite">
        Encontradas: {estado.encontradas} de {TOTAL_ESTRELLAS}
      </p>
      <button type="button" className="student-button student-button--secondary caf-ver" onClick={() => terminar(estado)}>
        Ver resultados
      </button>
    </div>
  );
}
