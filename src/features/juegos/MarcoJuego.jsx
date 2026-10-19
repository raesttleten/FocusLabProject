import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/routes.js';
import estrella from '../../assets/juegos/estrella-resultado.svg';
import EstudianteLayout from '../estudiante/EstudianteLayout.jsx';
import './Juegos.css';

export function MarcoJuego({ juego, terminado = false, estado = null, children }) {
  const acciones = (
    <>
      {terminado && <span className="juego-marco__terminado">Terminado</span>}
      {!terminado && estado && (
        <span className="juego-marco__terminado" aria-live="polite">
          {estado}
        </span>
      )}
      <Link className="student-button student-button--secondary juego-marco__salir" to={ROUTES.games}>
        Salir del juego
      </Link>
    </>
  );
  return (
    <EstudianteLayout titulo={juego.nombre} etiqueta={juego.habilidad} acciones={acciones} sinAvatar>
      <div className="student-card juego-marco">
        <div className="juego-escenario">{children}</div>
      </div>
    </EstudianteLayout>
  );
}

export function Instrucciones({ vista, texto, detalle, onEmpezar }) {
  return (
    <div className="juego-instrucciones">
      <div className="juego-instrucciones__vista" aria-hidden="true">
        {vista}
      </div>
      <h2 className="juego-instrucciones__titulo">Cómo se juega</h2>
      <p className="juego-instrucciones__texto">{texto}</p>
      <p className="juego-instrucciones__detalle">{detalle}</p>
      <button type="button" className="student-button juego-instrucciones__empezar" onClick={onEmpezar} autoFocus>
        Empezar
      </button>
    </div>
  );
}

export function Resultados({ titulo, metricas, onOtraVez }) {
  return (
    <div className="juego-resultados">
      <img className="juego-resultados__estrella" src={estrella} alt="" width="64" height="64" />
      <h2 className="juego-resultados__titulo">{titulo}</h2>
      <dl className="juego-resultados__metricas">
        {metricas.map(({ valor, etiqueta }) => (
          <div key={etiqueta} className="juego-resultados__metrica">
            <dt>{etiqueta}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
      <div className="juego-resultados__botones">
        <Link className="student-button student-button--secondary" to={ROUTES.games}>
          Volver a juegos
        </Link>
        <button type="button" className="student-button" onClick={onOtraVez}>
          Jugar otra vez
        </button>
      </div>
    </div>
  );
}
