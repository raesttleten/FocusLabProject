import { useEffect, useRef, useState } from 'react';
import luzVerde from '../../../assets/juegos/semaforo/luz-verde.svg';
import luzRoja from '../../../assets/juegos/semaforo/luz-roja.svg';
import { calcularMetricas, crearSecuencia, MS_APAGADA, MS_LUZ, registrarToque, TOTAL_LUCES, VERDE } from './logica.js';
import './SemaforoAtento.css';

const MENSAJES = {
  verde: '¡Bien! Estaba verde',
  roja: 'Esa estaba roja',
};

export const instrucciones = {
  vista: (
    <div className="sem-vista">
      <img src={luzVerde} alt="" width="64" height="64" />
      <img src={luzRoja} alt="" width="64" height="64" />
    </div>
  ),
  texto:
    'Verás una luz que cambia de color. Toca el botón o presiona la barra espaciadora solo cuando la luz esté verde. Si está roja, espera sin tocar.',
  detalle: `${TOTAL_LUCES} luces, unos 15 segundos`,
};

export function resultados(metricas) {
  const atento = metricas.verdesEscapadas === 0 && metricas.rojasTocadas <= 1;
  return {
    titulo: atento ? '¡Muy atento!' : '¡Buen trabajo!',
    metricas: [
      { valor: `${metricas.verdesTocadas} / ${metricas.totalVerdes}`, etiqueta: 'verdes que tocaste' },
      { valor: String(metricas.verdesEscapadas), etiqueta: 'verdes que se escaparon' },
      { valor: String(metricas.rojasTocadas), etiqueta: 'rojas que tocaste' },
      {
        valor: metricas.tiempoReaccionPromedioMs === null ? 'Sin toques' : `${metricas.tiempoReaccionPromedioMs} ms`,
        etiqueta: 'tiempo de reacción',
      },
    ],
  };
}

export function Jugando({ onTerminar, onEncabezado }) {
  const [secuencia] = useState(() => crearSecuencia());
  const [indice, setIndice] = useState(0);
  const [encendida, setEncendida] = useState(true);
  const [toques, setToques] = useState({});
  const toquesRef = useRef({});
  const inicioLuz = useRef(performance.now());
  const terminado = useRef(false);

  useEffect(() => {
    onEncabezado?.(`Luz ${indice + 1} de ${secuencia.length}`);
  }, [indice]);

  useEffect(() => {
    if (encendida) {
      inicioLuz.current = performance.now();
      const id = setTimeout(() => setEncendida(false), MS_LUZ);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      if (indice + 1 < secuencia.length) {
        setIndice(indice + 1);
        setEncendida(true);
      } else if (!terminado.current) {
        terminado.current = true;
        onTerminar(calcularMetricas(secuencia, toquesRef.current));
      }
    }, MS_APAGADA);
    return () => clearTimeout(id);
  }, [indice, encendida]);

  function tocar() {
    const nuevos = registrarToque(toquesRef.current, indice, performance.now() - inicioLuz.current);
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

  const luz = secuencia[indice];
  const tocada = toques[indice] !== undefined && encendida;

  return (
    <div className="sem-juego">
      <div className="sem-recuadro" aria-hidden="true">
        <span className={`sem-luz${encendida ? ` sem-luz--${luz}` : ''}`} data-luz={encendida ? luz : 'apagada'} />
      </div>
      <p className={`sem-titulo${tocada ? ` sem-titulo--${luz === VERDE ? 'acierto' : 'error'}` : ''}`} aria-live="polite">
        {tocada ? MENSAJES[luz] : 'Toca solo cuando la luz esté verde'}
      </p>
      <button type="button" className="student-button sem-boton" onPointerDown={tocar} onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}>
        ¡Toca!
      </button>
      <p className="sem-nota">La luz cambia sola cada segundo y medio.</p>
    </div>
  );
}
