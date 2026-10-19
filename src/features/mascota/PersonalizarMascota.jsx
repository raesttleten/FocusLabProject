import { useEffect, useRef, useState } from 'react';
import cerrar from '../../assets/estudiante/cerrar.svg';
import lapiz from '../../assets/estudiante/lapiz.svg';
import CheckIcon from '../../components/CheckIcon.jsx';
import { NOMBRE_MAXIMO, PRENDAS, validarNombreMascota } from './estado.js';
import { useMascota } from './useMascota.js';
import './PersonalizarMascota.css';

const ETIQUETA_PRENDA = { lila: 'Lila', rosa: 'Rosa', negro: 'Negro', verde: 'Verde' };

function Formulario({ onCerrar }) {
  const { nombre, prenda, imagen, guardar } = useMascota();
  const [nombreNuevo, setNombreNuevo] = useState(nombre);
  const [prendaNueva, setPrendaNueva] = useState(prenda);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const nombreValido = validarNombreMascota(nombreNuevo).valido;

  function handleSubmit(event) {
    event.preventDefault();
    setIntentoGuardar(true);
    if (!nombreValido) return;
    guardar({ nombre: nombreNuevo, prenda: prendaNueva });
    onCerrar();
  }

  return (
    <form className="personalizar__contenido" onSubmit={handleSubmit} noValidate>
      <header className="personalizar__encabezado">
        <div>
          <h2 id="personalizar-titulo" className="personalizar__titulo">
            Personaliza tu mascota
          </h2>
          <p id="personalizar-descripcion" className="personalizar__descripcion">
            Elige su nombre y su ropa.
          </p>
        </div>
        <button type="button" className="personalizar__cerrar" aria-label="Cerrar sin guardar" onClick={onCerrar}>
          <img src={cerrar} alt="" width="12" height="12" />
        </button>
      </header>

      <div className="personalizar__cuerpo">
        <div className="personalizar__vista">
          <img
            className="personalizar__mascota"
            src={imagen('prenda', prendaNueva)}
            alt={`Vista previa de ${nombreNuevo.trim() || 'tu mascota'} con ropa ${ETIQUETA_PRENDA[prendaNueva].toLowerCase()}`}
          />
        </div>

        <div className="personalizar__campos">
          <label className="personalizar__etiqueta" htmlFor="personalizar-nombre">
            Nombre
          </label>
          <div className={`personalizar__nombre${intentoGuardar && !nombreValido ? ' personalizar__nombre--error' : ''}`}>
            <input
              id="personalizar-nombre"
              type="text"
              value={nombreNuevo}
              maxLength={NOMBRE_MAXIMO}
              autoComplete="off"
              spellCheck="false"
              aria-invalid={intentoGuardar && !nombreValido}
              aria-describedby="personalizar-ayuda"
              onChange={(event) => setNombreNuevo(event.target.value)}
            />
            <img src={lapiz} alt="" width="18" height="18" />
          </div>
          <p id="personalizar-ayuda" className={`personalizar__ayuda${intentoGuardar && !nombreValido ? ' personalizar__ayuda--error' : ''}`} aria-live="polite">
            {intentoGuardar && !nombreValido ? 'Escribe un nombre para tu mascota.' : 'Hasta 12 letras.'}
          </p>

          <fieldset className="personalizar__ropa">
            <legend className="personalizar__etiqueta">Ropa</legend>
            <div className="personalizar__prendas">
              {PRENDAS.map((opcion) => (
                <label key={opcion} className="prenda-opcion">
                  <input
                    className="prenda-opcion__input"
                    type="radio"
                    name="prenda"
                    value={opcion}
                    checked={prendaNueva === opcion}
                    onChange={() => setPrendaNueva(opcion)}
                  />
                  <span className="prenda-opcion__tarjeta">
                    <img className="prenda-opcion__imagen" src={imagen('buzo', opcion)} alt="" />
                    <span className="prenda-opcion__nombre">{ETIQUETA_PRENDA[opcion]}</span>
                    {prendaNueva === opcion && <CheckIcon className="prenda-opcion__check" size={18} />}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <footer className="personalizar__acciones">
        <button type="button" className="student-button student-button--secondary personalizar__boton" onClick={onCerrar}>
          Cancelar
        </button>
        <button type="submit" className="student-button personalizar__boton">
          Guardar
        </button>
      </footer>
    </form>
  );
}

export default function PersonalizarMascota({ abierto, onCerrar }) {
  const dialogo = useRef(null);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) {
      elemento.showModal();
      elemento.querySelector('#personalizar-nombre')?.focus();
    } else if (!abierto && elemento.open) {
      elemento.close();
    }
  }, [abierto]);

  function handleCancel(event) {
    event.preventDefault();
    onCerrar();
  }

  return (
    <dialog
      ref={dialogo}
      className="personalizar"
      aria-labelledby="personalizar-titulo"
      aria-describedby="personalizar-descripcion"
      onCancel={handleCancel}
    >
      {abierto && <Formulario onCerrar={onCerrar} />}
    </dialog>
  );
}
