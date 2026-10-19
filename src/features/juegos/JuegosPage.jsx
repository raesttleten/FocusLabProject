import { Link } from 'react-router-dom';
import { ROUTES, routeTo } from '../../app/routes.js';
import candado from '../../assets/estudiante/candado.svg';
import EstudianteLayout from '../estudiante/EstudianteLayout.jsx';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import VistaPrevia from './VistaPrevia.jsx';
import { vistaJuegos } from './vistaJuegos.js';
import './Juegos.css';

const SUBTITULO = 'Los juegos se desbloquean con los puntos que ganas al responder los cuentos.';

function TarjetaJuego({ juego }) {
  return (
    <article className={`juego-tarjeta${juego.abierto ? '' : ' juego-tarjeta--bloqueado'}`}>
      <VistaPrevia id={juego.id} abierto={juego.abierto} />
      <h3 className="juego-tarjeta__nombre">{juego.nombre}</h3>
      <p className="juego-tarjeta__detalle">
        {juego.habilidad} · {juego.umbral} puntos
      </p>
      {juego.abierto ? (
        <Link className="student-button juego-tarjeta__jugar" to={routeTo(ROUTES.game, { juegoId: juego.id })}>
          Jugar
        </Link>
      ) : (
        <p className="juego-tarjeta__bloqueo">
          <img src={candado} alt="" width="16" height="18" />
          {juego.aviso}
        </p>
      )}
    </article>
  );
}

export default function JuegosPage() {
  const progreso = useProgreso();
  if (progreso.cargando || progreso.error) return <EstudianteLayout titulo="Juegos" subtitulo={SUBTITULO} />;
  const { columnas, aviso } = vistaJuegos(progreso);

  return (
    <EstudianteLayout titulo="Juegos" subtitulo={SUBTITULO}>
      <div className="juegos">
        {columnas.map((columna) => (
          <section key={columna.dia} className="juegos__columna" aria-label={`Juegos del día ${columna.dia}`}>
            <span className={`juegos__dia${columna.esHoy ? ' juegos__dia--hoy' : ''}`}>{columna.etiqueta}</span>
            {columna.juegos.map((juego) => (
              <TarjetaJuego key={juego.id} juego={juego} />
            ))}
          </section>
        ))}
      </div>
      {aviso && (
        <aside className="juegos__aviso">
          <p className="juegos__aviso-titulo">{aviso.titulo}</p>
          <p className="juegos__aviso-texto">{aviso.texto}</p>
        </aside>
      )}
    </EstudianteLayout>
  );
}
