import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ROUTES, routeTo } from '../../app/routes.js';
import { CUENTO_IDS, getCuento, puntosPorCuento } from '../contenido/cuentos.js';
import EstudianteLayout from '../estudiante/EstudianteLayout.jsx';
import { numeroDeCuento } from '../estudiante/vistaInicio.js';
import { juegosRecienDesbloqueados } from '../juegos/catalogo.js';
import Mascota from '../mascota/Mascota.jsx';
import { estadoMascota, PANTALLA } from '../mascota/estado.js';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { fechaColombia } from '../progreso/fechas.js';
import { debeMostrarTransicion, ESTADO_CUENTO } from '../progreso/modelo.js';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import { marcarTransicion } from '../progreso/repositorio.js';
import './LogradoPage.css';

function Logrado({ cuento, progreso }) {
  const { uid, diaActual, registroDia, respuestas, puntosTotales, ahora } = progreso;
  const { dia } = diaActual;
  const [mostrarTransicion] = useState(() =>
    debeMostrarTransicion({ respuestas, cuentoId: cuento.id, registro: registroDia, ahora }),
  );

  useEffect(() => {
    if (mostrarTransicion) marcarTransicion(uid, dia, fechaColombia(ahora));
  }, [mostrarTransicion]);

  const puntosGanados = puntosPorCuento(dia);
  const juego = juegosRecienDesbloqueados(puntosTotales - puntosGanados, puntosTotales)[0];
  const otroPendiente = CUENTO_IDS.find(
    (id) => id !== cuento.id && registroDia?.cuentos?.[id] !== ESTADO_CUENTO.finished,
  );
  const mensaje = otroPendiente
    ? `Respondiste todas las preguntas del cuento ${numeroDeCuento(cuento.id)}.${mostrarTransicion ? ' ¡Tu mascota ya no tiene frío!' : ''}`
    : `Terminaste los dos cuentos del día ${dia}.`;

  return (
    <EstudianteLayout titulo={cuento.titulo} subtitulo={`Cuento ${numeroDeCuento(cuento.id)} de 2 · Día ${dia}`}>
      <section className="student-card logrado" aria-labelledby="logrado-titulo">
        <Mascota estado={estadoMascota({ pantalla: PANTALLA.success, mostrarTransicion })} tamano={220} />
        <h2 id="logrado-titulo" className="logrado__titulo">
          ¡Lo lograste!
        </h2>
        <p className="logrado__mensaje">{mensaje}</p>
        <span className="logrado__puntos">+{puntosGanados} puntos</span>

        {juego && (
          <div className="logrado-juego">
            <span className="logrado-juego__icono" aria-hidden="true" />
            <div className="logrado-juego__info">
              <p className="logrado-juego__etiqueta">DESBLOQUEASTE UN JUEGO</p>
              <p className="logrado-juego__nombre">{juego.nombre}</p>
              <p className="logrado-juego__detalle">Llegaste a {juego.umbral} puntos</p>
            </div>
            <Link className="student-button logrado-juego__boton" to={routeTo(ROUTES.game, { juegoId: juego.id })}>
              Jugar ahora
            </Link>
          </div>
        )}

        {otroPendiente ? (
          <Link
            className="student-button student-button--secondary logrado__despues"
            to={routeTo(ROUTES.reading, { cuentoId: otroPendiente })}
          >
            Leer el cuento {numeroDeCuento(otroPendiente)}
          </Link>
        ) : (
          <Link className="student-button student-button--secondary logrado__despues" to={ROUTES.studentHome}>
            Volver al inicio
          </Link>
        )}
      </section>
    </EstudianteLayout>
  );
}

export default function LogradoPage() {
  const { cuentoId } = useParams();
  const { state } = useLocation();
  const progreso = useProgreso();
  const cuento = getCuento(cuentoId);

  if (!cuento) return <Navigate to={ROUTES.studentHome} replace />;
  if (progreso.cargando || progreso.error) return <EstudianteLayout titulo={cuento.titulo} />;
  const terminado =
    state?.recienTerminado === cuento.id ||
    progreso.registroDia?.cuentos?.[cuento.id] === ESTADO_CUENTO.finished ||
    progreso.diaActual.estado === ESTADO_DIA.allDone;
  if (!terminado) return <Navigate to={ROUTES.studentHome} replace />;
  return <Logrado key={cuento.id} cuento={cuento} progreso={progreso} />;
}
