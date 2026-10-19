import { useEffect, useRef, useState } from 'react';
import { calcularMetricas, crearRonda, elegir, estadoInicial, EVENTO, formatearSegundos, TOTAL_RONDAS } from './logica.js';
import './EncuentraElPar.css';

const MS_ACIERTO = 900;
const MS_ERROR = 700;
const MS_REVELAR = 1500;

const MENSAJES = {
  [EVENTO.found]: '¡Las encontraste!',
  [EVENTO.wrong]: 'No son iguales. Sigue buscando.',
  [EVENTO.lost]: 'Eran estas dos.',
};

function Forma({ forma, tono, tamano = 56 }) {
  const relleno = { fill: 'currentColor', opacity: tono };
  return (
    <svg className="eep-forma" width={tamano} height={tamano} viewBox="0 0 56 56" aria-hidden="true">
      {forma === 'circulo' && <circle cx="28" cy="28" r="22" style={relleno} />}
      {forma === 'cuadrado' && <rect x="8" y="8" width="40" height="40" rx="7" style={relleno} />}
      {forma === 'triangulo' && <path d="M28 7 L50 47 H6 Z" strokeLinejoin="round" style={relleno} />}
      {forma === 'rombo' && <path d="M28 5 L51 28 L28 51 L5 28 Z" style={relleno} />}
    </svg>
  );
}

const VISTA = [
  ['circulo', 1], ['cuadrado', 0.55], ['triangulo', 0.25], ['rombo', 1],
  ['triangulo', 1], ['circulo', 0.25], ['rombo', 0.55], ['rombo', 1],
];

export const instrucciones = {
  vista: (
    <div className="eep-vista">
      {VISTA.map(([forma, tono], i) => (
        <Forma key={i} forma={forma} tono={tono} tamano={40} />
      ))}
    </div>
  ),
  texto: 'Entre todas las figuras hay solo dos exactamente iguales: misma forma y mismo tono. Toca las dos.',
  detalle: `${TOTAL_RONDAS} rondas`,
};

export function resultados(metricas) {
  return {
    titulo: '¡Gran atención al detalle!',
    metricas: [
      { valor: `${metricas.rondasAcertadas} / ${metricas.totalRondas}`, etiqueta: 'pares encontrados' },
      { valor: formatearSegundos(metricas.tiempoPromedioPorParMs), etiqueta: 'tiempo promedio por par' },
    ],
  };
}

export function Jugando({ onTerminar, onEncabezado }) {
  const [numero, setNumero] = useState(1);
  const [ronda, setRonda] = useState(() => crearRonda());
  const [estado, setEstado] = useState(estadoInicial);
  const [aviso, setAviso] = useState(null);
  const inicioRonda = useRef(performance.now());
  const rondas = useRef([]);

  useEffect(() => {
    onEncabezado?.(`Ronda ${numero} de ${TOTAL_RONDAS}`);
  }, [numero]);

  useEffect(() => {
    if (!aviso) return undefined;
    const espera = { [EVENTO.found]: MS_ACIERTO, [EVENTO.wrong]: MS_ERROR, [EVENTO.lost]: MS_REVELAR }[aviso.evento];
    const id = setTimeout(() => {
      if (aviso.evento === EVENTO.wrong) {
        setAviso(null);
        return;
      }
      if (numero >= TOTAL_RONDAS) {
        onTerminar(calcularMetricas(rondas.current));
        return;
      }
      setNumero(numero + 1);
      setRonda(crearRonda());
      setEstado(estadoInicial());
      setAviso(null);
      inicioRonda.current = performance.now();
    }, espera);
    return () => clearTimeout(id);
  }, [aviso]);

  function tocar(indice) {
    if (aviso) return;
    const anterior = estado.seleccion;
    const paso = elegir(estado, ronda, indice);
    setEstado(paso.estado);
    if (paso.evento === EVENTO.wrong || paso.evento === EVENTO.found || paso.evento === EVENTO.lost) {
      setAviso({ evento: paso.evento, tocadas: [anterior, indice] });
    }
    if (paso.estado.terminada && !estado.terminada) {
      rondas.current = [
        ...rondas.current,
        { acertada: paso.estado.acertada, errores: paso.estado.errores, ms: Math.round(performance.now() - inicioRonda.current) },
      ];
    }
  }

  function clase(indice) {
    if (aviso?.evento === EVENTO.found && aviso.tocadas.includes(indice)) return ' eep-celda--acierto';
    if (aviso?.evento === EVENTO.wrong && aviso.tocadas.includes(indice)) return ' eep-celda--error';
    if (aviso?.evento === EVENTO.lost) {
      if (ronda.par.includes(indice)) return ' eep-celda--revelada';
      if (aviso.tocadas.includes(indice)) return ' eep-celda--error';
    }
    return estado.seleccion === indice ? ' eep-celda--seleccionada' : '';
  }

  return (
    <div className="eep-juego">
      <div className="eep-tablero" role="group" aria-label="Figuras">
        {ronda.figuras.map((figura, i) => (
          <button
            key={`${numero}-${i}`}
            type="button"
            className={`eep-celda${clase(i)}`}
            aria-pressed={estado.seleccion === i}
            aria-label={`Figura ${i + 1}`}
            data-forma={figura.forma}
            data-tono={figura.tono}
            onClick={() => tocar(i)}
          >
            <Forma forma={figura.forma} tono={figura.tono} />
          </button>
        ))}
      </div>
      <p className={`eep-ayuda${aviso ? ` eep-ayuda--${aviso.evento}` : ''}`} aria-live="polite">
        {aviso ? MENSAJES[aviso.evento] : 'Toca las dos figuras iguales'}
      </p>
    </div>
  );
}
