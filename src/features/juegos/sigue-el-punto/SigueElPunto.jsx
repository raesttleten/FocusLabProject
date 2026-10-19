import { useEffect, useRef, useState } from 'react';
import ilustracion from '../../../assets/juegos/sigue-el-punto-instrucciones.svg';
import {
  calcularMetricas,
  crearPuntos,
  elegirMarcado,
  MS_MARCADO,
  MS_MOVIMIENTO,
  moverPuntos,
  nivelConcentracion,
  TOTAL_RONDAS,
} from './logica.js';
import './SigueElPunto.css';

const MS_INICIO = 700;
const MS_RESPUESTA = 1400;

const FASE = {
  start: 'inicio',
  marked: 'marcado',
  moving: 'moviendo',
  answer: 'respuesta',
  feedback: 'feedback',
};

export const instrucciones = {
  vista: <img src={ilustracion} alt="" width="220" height="100" />,
  texto: 'Un punto se pintará de color por un momento. Luego todos se mueven. No le quites la mirada y, cuando se detengan, tócalo.',
  detalle: `${TOTAL_RONDAS} rondas, cerca de 1 minuto`,
};

export function resultados(metricas) {
  return {
    titulo: '¡Ojos de águila!',
    metricas: [
      { valor: `${metricas.rondasAcertadas} / ${metricas.totalRondas}`, etiqueta: 'veces que lo seguiste' },
      { valor: nivelConcentracion(metricas.rondasAcertadas), etiqueta: 'concentración visual' },
    ],
  };
}

function textos(fase, ronda, acerto) {
  const prefijo = `Ronda ${ronda} de ${TOTAL_RONDAS}`;
  switch (fase) {
    case FASE.marked:
      return { encabezado: `${prefijo}: mira el punto`, centro: 'Mira el punto de color' };
    case FASE.moving:
      return { encabezado: `${prefijo}: síguelo`, centro: 'No le quites la mirada' };
    case FASE.answer:
      return { encabezado: `${prefijo}: ¿cuál era? Tócalo`, centro: '¿Cuál era el punto marcado?' };
    case FASE.feedback:
      return { encabezado: `${prefijo}: ¿cuál era? Tócalo`, centro: acerto ? '¡Ese era!' : 'Ese no era. Era el de color.' };
    default:
      return { encabezado: `${prefijo}: prepárate`, centro: 'Prepárate' };
  }
}

export function Jugando({ onTerminar, onEncabezado }) {
  const [ronda, setRonda] = useState(1);
  const [fase, setFase] = useState(FASE.start);
  const [puntos, setPuntos] = useState(() => crearPuntos());
  const [marcado, setMarcado] = useState(() => elegirMarcado());
  const [elegido, setElegido] = useState(null);
  const rondas = useRef([]);
  const detenidoEn = useRef(0);

  const acerto = elegido === marcado;
  const { encabezado, centro } = textos(fase, ronda, acerto);

  useEffect(() => {
    onEncabezado?.(encabezado);
  }, [encabezado]);

  useEffect(() => {
    if (fase === FASE.start) {
      const id = setTimeout(() => setFase(FASE.marked), MS_INICIO);
      return () => clearTimeout(id);
    }
    if (fase === FASE.marked) {
      const id = setTimeout(() => setFase(FASE.moving), MS_MARCADO);
      return () => clearTimeout(id);
    }
    if (fase === FASE.moving) {
      let anterior = performance.now();
      let cuadro = requestAnimationFrame(function paso(ahora) {
        const segundos = Math.min((ahora - anterior) / 1000, 0.05);
        anterior = ahora;
        setPuntos((actuales) => moverPuntos(actuales, segundos));
        cuadro = requestAnimationFrame(paso);
      });
      const id = setTimeout(() => {
        cancelAnimationFrame(cuadro);
        detenidoEn.current = performance.now();
        setFase(FASE.answer);
      }, MS_MOVIMIENTO);
      return () => {
        cancelAnimationFrame(cuadro);
        clearTimeout(id);
      };
    }
    if (fase === FASE.feedback) {
      const id = setTimeout(() => {
        if (ronda >= TOTAL_RONDAS) {
          onTerminar(calcularMetricas(rondas.current));
          return;
        }
        setRonda(ronda + 1);
        setPuntos(crearPuntos());
        setMarcado(elegirMarcado());
        setElegido(null);
        setFase(FASE.start);
      }, MS_RESPUESTA);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [fase]);

  function tocar(indice) {
    if (fase !== FASE.answer) return;
    rondas.current = [
      ...rondas.current,
      { acertada: indice === marcado, ms: Math.round(performance.now() - detenidoEn.current) },
    ];
    setElegido(indice);
    setFase(FASE.feedback);
  }

  function clasePunto(indice) {
    if (fase === FASE.marked && indice === marcado) return ' sep-punto--marcado';
    if (fase !== FASE.feedback) return '';
    if (indice === elegido) return acerto ? ' sep-punto--acierto' : ' sep-punto--error';
    if (indice === marcado) return ' sep-punto--marcado';
    return '';
  }

  return (
    <div className="sep-juego">
      <p className={`sep-centro${fase === FASE.feedback ? (acerto ? ' sep-centro--acierto' : ' sep-centro--error') : ''}`} aria-live="polite">
        {centro}
      </p>
      <div className="sep-arena">
        {puntos.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`sep-punto${clasePunto(i)}`}
            style={{ left: `calc(${p.x} * (100% - 48px))`, top: `calc(${p.y} * (100% - 48px))` }}
            aria-label={`Punto ${i + 1}`}
            aria-disabled={fase !== FASE.answer}
            data-punto={i}
            onClick={() => tocar(i)}
          />
        ))}
      </div>
    </div>
  );
}
