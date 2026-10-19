import { useEffect, useRef, useState } from 'react';
import {
  calcularMetricas,
  crearSecuencia,
  LETRA_OBJETIVO,
  MS_LETRA,
  MS_VACIO,
  registrarToque,
  resultadoToque,
  TOTAL_LETRAS,
} from './logica.js';
import './ATodoFoco.css';

const MENSAJES = {
  acierto: '¡Bien! Era la X',
  error: 'Esa no era la X',
};

export const instrucciones = {
  vista: (
    <div className="atf-fichas">
      {['K', 'X', 'P'].map((letra) => (
        <span key={letra} className={`atf-ficha${letra === LETRA_OBJETIVO ? ' atf-ficha--x' : ''}`}>
          {letra}
        </span>
      ))}
    </div>
  ),
  texto:
    'Verás letras una por una. Toca el recuadro o presiona la barra espaciadora solo cuando aparezca la X. Si sale otra letra, no toques nada.',
  detalle: `${TOTAL_LETRAS} letras, cerca de 1 minuto`,
};

export function resultados(metricas) {
  const concentrado = metricas.xEscapadas === 0 && metricas.toquesOtraLetra <= 1;
  return {
    titulo: concentrado ? '¡Muy concentrado!' : '¡Buen trabajo!',
    metricas: [
      { valor: `${metricas.xTocadas} / ${metricas.totalX}`, etiqueta: 'X que tocaste' },
      { valor: String(metricas.xEscapadas), etiqueta: 'X que se escapó' },
      { valor: String(metricas.toquesOtraLetra), etiqueta: 'toques en otra letra' },
      {
        valor: metricas.tiempoReaccionPromedioMs === null ? 'Sin toques' : `${metricas.tiempoReaccionPromedioMs} ms`,
        etiqueta: 'tiempo de reacción',
      },
    ],
  };
}

export function Jugando({ onTerminar }) {
  const [secuencia] = useState(() => crearSecuencia());
  const [indice, setIndice] = useState(0);
  const [visible, setVisible] = useState(true);
  const [toques, setToques] = useState({});
  const inicioLetra = useRef(performance.now());
  const toquesRef = useRef(toques);
  const terminado = useRef(false);

  useEffect(() => {
    if (visible) {
      inicioLetra.current = performance.now();
      const id = setTimeout(() => setVisible(false), MS_LETRA);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      if (indice + 1 < secuencia.length) {
        setIndice(indice + 1);
        setVisible(true);
      } else if (!terminado.current) {
        terminado.current = true;
        onTerminar(calcularMetricas(secuencia, toquesRef.current));
      }
    }, MS_VACIO);
    return () => clearTimeout(id);
  }, [indice, visible]);

  function tocar() {
    const nuevos = registrarToque(toquesRef.current, indice, performance.now() - inicioLetra.current);
    toquesRef.current = nuevos;
    setToques(nuevos);
  }

  useEffect(() => {
    const alPresionar = (event) => {
      if (event.code !== 'Space' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) tocar();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  });

  const letra = secuencia[indice];
  const resultado = visible ? resultadoToque(letra, toques[indice] !== undefined) : null;

  return (
    <div className="atf-juego">
      <p className="atf-contador" aria-live="off">
        Letra {indice + 1} de {secuencia.length}
      </p>
      <button
        type="button"
        className={`atf-recuadro${resultado ? ` atf-recuadro--${resultado}` : ''}`}
        aria-label="Recuadro de la letra"
        onPointerDown={tocar}
        onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
      >
        {visible && <span className="atf-letra">{letra}</span>}
      </button>
      <p className={`atf-ayuda${resultado ? ` atf-ayuda--${resultado}` : ''}`}>
        {resultado ? MENSAJES[resultado] : 'Toca solo cuando veas la X'}
      </p>
      <div className="atf-progreso" aria-hidden="true">
        <span style={{ width: `${((indice + 1) / secuencia.length) * 100}%` }} />
      </div>
    </div>
  );
}
