import { visualMascota } from './estado.js';
import { LUZ_MASCOTA } from './imagenes.js';
import { useMascota } from './useMascota.js';
import './Mascota.css';

export default function Mascota({ estado, tamano = 240, prenda: prendaVistaPrevia, className = '' }) {
  const { nombre, imagen } = useMascota();
  const visual = visualMascota(estado);
  const conTransicion = visual.animacion === 'transicion';
  const estilo = {
    '--mascota-tamano': `${tamano}px`,
    '--luz-inicial': visual.luzInicial ?? visual.luz,
    '--luz-final': visual.luz,
    '--luz-imagen': `url("${LUZ_MASCOTA}")`,
  };

  return (
    <div
      className={`mascota mascota--${visual.animacion} ${className}`}
      style={estilo}
      role="img"
      aria-label={`${nombre}, tu mascota`}
      data-estado={estado}
    >
      <span className="mascota__luz" aria-hidden="true" />
      <div className="mascota__cuerpo">
        {conTransicion && (
          <img className="mascota__imagen mascota__imagen--inicial" src={imagen(visual.imagenInicial, prendaVistaPrevia)} alt="" />
        )}
        <img className="mascota__imagen mascota__imagen--final" src={imagen(visual.imagen, prendaVistaPrevia)} alt="" />
      </div>
    </div>
  );
}
