import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ROUTES, routeTo } from '../../app/routes.js';
import { esOpinion, getCuento, getPreguntas } from '../contenido/cuentos.js';
import EstudianteLayout from '../estudiante/EstudianteLayout.jsx';
import { numeroDeCuento } from '../estudiante/vistaInicio.js';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { ESTADO_CUENTO } from '../progreso/modelo.js';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import { asegurarDia, guardarPreguntaActual, guardarRespuesta, terminarCuento } from '../progreso/repositorio.js';
import { ahora } from '../progreso/reloj.js';
import {
  aplicarToque,
  confirmarOpinion,
  estadoVisual,
  indiceInicial,
  LETRAS,
  RESULTADO,
  respuestaInicial,
} from './respuestas.js';
import './PreguntasPage.css';

const MENSAJES = {
  [RESULTADO.correct]: '¡Muy bien! +10 puntos',
  [RESULTADO.wrong]: 'Esa no es. Vuelve a leer el cuento y prueba otra.',
  [RESULTADO.opinion]: '¡Gracias por contarnos! +10 puntos',
};

function masReciente(guardada, borrador) {
  if (!borrador) return guardada;
  if (!guardada) return borrador;
  return borrador.intentos > guardada.intentos || (borrador.completada && !guardada.completada) ? borrador : guardada;
}

function Preguntas({ cuento, progreso }) {
  const navigate = useNavigate();
  const { uid, diaActual, registroDia, respuestas } = progreso;
  const { dia } = diaActual;
  const preguntas = getPreguntas(cuento.id, dia);
  const terminando = useRef(false);

  const respuestasDelCuento = useMemo(
    () =>
      Object.fromEntries(
        respuestas.filter((r) => r.dia === dia && r.cuento === cuento.id).map((r) => [r.indice, r]),
      ),
    [respuestas, dia, cuento.id],
  );

  const [indice, setIndice] = useState(() =>
    indiceInicial({
      preguntas,
      respuestasDelCuento,
      guardada: registroDia?.preguntaActual?.cuento === cuento.id ? registroDia.preguntaActual.indice : undefined,
    }),
  );
  const [borradores, setBorradores] = useState({});

  const pregunta = preguntas[indice];
  const respuesta = masReciente(respuestasDelCuento[indice], borradores[indice]);
  const visual = estadoVisual(respuesta, pregunta);
  const esUltima = indice === preguntas.length - 1;
  const cuentoTerminado = registroDia?.cuentos?.[cuento.id] === ESTADO_CUENTO.finished;
  const cerrado = cuentoTerminado || diaActual.estado !== ESTADO_DIA.inProgress;

  useEffect(() => {
    if (terminando.current || cerrado) return;
    asegurarDia(uid, dia, registroDia, ahora());
    guardarPreguntaActual(uid, dia, { cuento: cuento.id, indice });
    if (!respuestasDelCuento[indice] && !borradores[indice]) {
      const inicial = respuestaInicial({ dia, cuentoId: cuento.id, indice, pregunta, hora: ahora() });
      setBorradores((actuales) => ({ ...actuales, [indice]: inicial }));
      guardarRespuesta(uid, inicial);
    }
  }, [indice]);

  if (!terminando.current && cerrado) {
    return <Navigate to={ROUTES.studentHome} replace />;
  }

  function guardar(nueva) {
    if (nueva === respuesta) return;
    setBorradores((actuales) => ({ ...actuales, [indice]: nueva }));
    guardarRespuesta(uid, nueva);
  }

  function tocar(indiceOpcion) {
    if (!respuesta || visual.bloqueada) return;
    guardar(aplicarToque(respuesta, pregunta, indiceOpcion, ahora()));
  }

  function siguiente() {
    if (!visual.puedeAvanzar) return;
    if (esOpinion(pregunta)) guardar(confirmarOpinion(respuesta, ahora()));
    if (!esUltima) {
      setIndice(indice + 1);
      return;
    }
    terminando.current = true;
    terminarCuento(uid, dia, registroDia, cuento.id, ahora());
    navigate(routeTo(ROUTES.storyDone, { cuentoId: cuento.id }), { replace: true, state: { recienTerminado: cuento.id } });
  }

  function volverALeer() {
    navigate(routeTo(ROUTES.reading, { cuentoId: cuento.id }), { state: { desdePreguntas: true } });
  }

  return (
    <EstudianteLayout titulo={cuento.titulo} subtitulo={`Cuento ${numeroDeCuento(cuento.id)} de 2 · Día ${dia}`}>
      <div className="student-card preguntas">
        <div className="pregunta">
          <div className="pregunta__progreso">
            <span className="student-chip">
              PREGUNTA {indice + 1} DE {preguntas.length}
            </span>
            <div className="pregunta__barras" aria-hidden="true">
              {preguntas.map((_, i) => (
                <span key={i} className={`pregunta__barra${i <= indice ? ' pregunta__barra--hecha' : ''}`} />
              ))}
            </div>
          </div>
          <span className="pregunta__tipo">{pregunta.tipo.toUpperCase()}</span>
          <h2 id="pregunta-enunciado" className="pregunta__enunciado">
            {pregunta.enunciado}
          </h2>
          <p className="pregunta__pista">Pista: {pregunta.pista}</p>

          <div className="respuestas" role="group" aria-labelledby="pregunta-enunciado">
            {pregunta.opciones.map((opcion, i) => {
              const marcada = visual.seleccion === i;
              const clase = marcada ? ` respuesta--${visual.resultado}` : '';
              return (
                <button
                  key={i}
                  type="button"
                  className={`respuesta${clase}`}
                  aria-pressed={marcada}
                  aria-disabled={visual.bloqueada && !marcada}
                  onClick={() => tocar(i)}
                >
                  <span className="respuesta__letra">{LETRAS[i]}</span>
                  <span className="respuesta__texto">{opcion}</span>
                </button>
              );
            })}
          </div>

          <p className={`respuestas__mensaje respuestas__mensaje--${visual.resultado ?? 'neutro'}`} aria-live="polite">
            {visual.resultado ? MENSAJES[visual.resultado] : 'Escoge una sola respuesta.'}
          </p>
          <div className="pregunta__acciones">
            <button type="button" className="student-button student-button--secondary pregunta__releer" onClick={volverALeer}>
              Volver a leer el cuento
            </button>
            <button type="button" className="student-button pregunta__siguiente" disabled={!visual.puedeAvanzar} onClick={siguiente}>
              {esUltima ? 'Terminar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </EstudianteLayout>
  );
}

export default function PreguntasPage() {
  const { cuentoId } = useParams();
  const progreso = useProgreso();
  const cuento = getCuento(cuentoId);

  if (!cuento) return <Navigate to={ROUTES.studentHome} replace />;
  if (progreso.cargando || progreso.error) return <EstudianteLayout titulo={cuento.titulo} />;
  return <Preguntas key={cuento.id} cuento={cuento} progreso={progreso} />;
}
