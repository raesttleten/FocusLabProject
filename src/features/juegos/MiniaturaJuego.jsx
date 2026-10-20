import VistaPrevia from './VistaPrevia.jsx';
import './MiniaturaJuego.css';

const ANCHO_VISTA = 232;

export default function MiniaturaJuego({ id, abierto = true, ancho = 96 }) {
  return (
    <span className="miniatura-juego" style={{ '--miniatura-ancho': `${ancho}px`, '--miniatura-zoom': ancho / ANCHO_VISTA }} aria-hidden="true">
      <VistaPrevia id={id} abierto={abierto} />
    </span>
  );
}
