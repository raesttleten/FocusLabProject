import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ROUTES, routeTo } from '../../app/routes.js';
import { useAuth } from '../../auth/AuthProvider.jsx';
import { getCuento, getDia, segmentarResaltado } from '../contenido/cuentos.js';
import { PORTADAS } from '../contenido/portadas.js';
import EstudianteLayout from '../estudiante/EstudianteLayout.jsx';
import { numeroDeCuento } from '../estudiante/vistaInicio.js';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { ESTADO_CUENTO } from '../progreso/modelo.js';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import { guardarLecturaPendiente } from '../progreso/pendientes.js';
import { asegurarDia, registrarLectura } from '../progreso/repositorio.js';
import { ahora } from '../progreso/reloj.js';
import { formatearTiempo, useCronometroVisible } from './useCronometroVisible.js';
import './LecturaPage.css';

function Parrafo({ texto }) {
  return (
    <p>
      {segmentarResaltado(texto).map((segmento, i) =>
        segmento.resaltado ? (
          <strong key={i} className="lectura-resaltado">
            {segmento.texto}
          </strong>
        ) : (
          segmento.texto
        ),
      )}
    </p>
  );
}

function Lectura({ cuento, progreso }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { segundos, leer } = useCronometroVisible();
  const { alCerrarSesion } = useAuth();
  const registrada = useRef(false);
  const { uid, diaActual, registroDia } = progreso;
  const { dia } = diaActual;
  const cuentoTerminado =
    registroDia?.cuentos?.[cuento.id] === ESTADO_CUENTO.finished ||
    diaActual.estado !== ESTADO_DIA.inProgress;
  const repaso = cuentoTerminado || state?.repaso === true;
  const desdePreguntas = !repaso && state?.desdePreguntas === true;

  useEffect(() => {
    if (!repaso) asegurarDia(uid, dia, registroDia, ahora());
  }, [repaso, uid, dia, registroDia]);

  const registrar = useRef(null);
  registrar.current = (alCerrarPagina = false) => {
    const leidos = leer();
    if (registrada.current || leidos < 1) return;
    registrada.current = true;
    const lectura = { dia, cuento: cuento.id, segundos: leidos, modo: repaso ? 'repaso' : 'primera', fecha: ahora() };
    if (!alCerrarPagina || !guardarLecturaPendiente(uid, lectura)) registrarLectura(uid, lectura);
  };

  useEffect(() => {
    const alSalir = () => registrar.current();
    const alCerrarPagina = () => registrar.current(true);
    const dejarCierre = alCerrarSesion(alSalir);
    window.addEventListener('pagehide', alCerrarPagina);
    return () => {
      window.removeEventListener('pagehide', alCerrarPagina);
      dejarCierre();
      alSalir();
    };
  }, [alCerrarSesion]);

  function terminarLectura() {
    registrar.current();
    if (repaso) navigate(ROUTES.studentHome);
    else navigate(routeTo(ROUTES.questions, { cuentoId: cuento.id }), { replace: desdePreguntas });
  }

  const textoBoton = repaso
    ? 'Volver al inicio'
    : desdePreguntas
      ? 'Volver a las preguntas'
      : 'Ya leí · ir a las preguntas';

  return (
    <EstudianteLayout titulo={cuento.titulo} subtitulo={`Cuento ${numeroDeCuento(cuento.id)} de 2 · Día ${dia}`}>
      <div className="student-card lectura">
        <article className="lectura-texto" tabIndex={0} aria-label={`Texto de ${cuento.titulo}`}>
          {cuento.parrafos.map((parrafo, i) => (
            <Parrafo key={i} texto={parrafo} />
          ))}
        </article>

        <aside className="lectura-panel">
          <div className="lectura-panel__info">
            <img className="lectura-panel__portada" src={PORTADAS[cuento.id]} alt="" />
            <span className="student-chip lectura-panel__chip">{repaso ? 'LEER OTRA VEZ' : 'ANTES DE RESPONDER'}</span>
            <h2 className="lectura-panel__titulo">Lee con calma</h2>
            <p className="lectura-panel__ayuda">Desliza el texto hacia abajo para seguir leyendo.</p>
            <div className="lectura-buscar">
              <p className="lectura-buscar__titulo">HOY VAS A BUSCAR</p>
              {getDia(dia).explicacion.map((linea, i) => (
                <p key={i} className="lectura-buscar__texto">
                  {linea}
                </p>
              ))}
            </div>
          </div>
          <div className="lectura-tiempo" aria-live="off">
            <p className="lectura-tiempo__etiqueta">Tiempo de lectura</p>
            <p className="lectura-tiempo__valor">{formatearTiempo(segundos)}</p>
          </div>
          <button type="button" className="student-button lectura-panel__boton" onClick={terminarLectura}>
            {textoBoton}
          </button>
        </aside>
      </div>
    </EstudianteLayout>
  );
}

export default function LecturaPage() {
  const { cuentoId } = useParams();
  const progreso = useProgreso();
  const cuento = getCuento(cuentoId);

  if (!cuento) return <Navigate to={ROUTES.studentHome} replace />;
  if (progreso.cargando || progreso.error) return <EstudianteLayout titulo={cuento.titulo} />;
  return <Lectura key={cuento.id} cuento={cuento} progreso={progreso} />;
}
