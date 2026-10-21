import { useEffect, useRef } from 'react';
import cerrar from '../../assets/estudiante/cerrar.svg';
import { nombrePeriodo, PERIODOS } from './indicadores.js';

export function Tarjeta({ etiqueta, valor, detalle, punto }) {
  return (
    <section className="panel-tarjeta">
      <h2 className="panel-tarjeta__etiqueta">
        {punto && <span className="panel-punto" style={{ background: punto }} aria-hidden="true" />}
        {etiqueta}
      </h2>
      <p className={`panel-tarjeta__valor${valor == null ? ' panel-tarjeta__valor--vacio' : ''}`}>{valor ?? 'Sin datos'}</p>
      {detalle && <p className="panel-tarjeta__detalle">{detalle}</p>}
    </section>
  );
}

export function Dato({ valor, clase = '', vacio = 'Sin datos' }) {
  if (valor == null) return <span className="panel-sin-dato">{vacio}</span>;
  return <span className={clase}>{valor}</span>;
}

export function FiltroDias({ valor, onCambiar, etiqueta = 'Periodo' }) {
  return (
    <div className="panel-filtro" role="radiogroup" aria-label={etiqueta}>
      {PERIODOS.map((periodo) => (
        <button
          key={periodo}
          type="button"
          role="radio"
          aria-checked={valor === periodo}
          className={`panel-filtro__opcion${valor === periodo ? ' activo' : ''}`}
          onClick={() => onCambiar(periodo)}
        >
          {nombrePeriodo(periodo)}
        </button>
      ))}
    </div>
  );
}

export function Chip({ estado, children }) {
  return (
    <span className={`panel-chip panel-chip--${estado}`}>
      <span className="panel-chip__punto" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Ventana({ abierta, onCerrar, titulo, etiqueta, subtitulo, ancho = 760, pie, children }) {
  const dialogo = useRef(null);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierta && !elemento.open) {
      elemento.showModal();
      elemento.querySelector('.panel-ventana__titulo')?.focus();
    } else if (!abierta && elemento.open) {
      elemento.close();
    }
  }, [abierta]);

  function handleCancel(event) {
    event.preventDefault();
    onCerrar();
  }

  return (
    <dialog
      ref={dialogo}
      className="panel-ventana"
      style={{ '--ancho-ventana': `${ancho}px` }}
      aria-labelledby="panel-ventana-titulo"
      onCancel={handleCancel}
      onClick={(event) => event.target === dialogo.current && onCerrar()}
    >
      {abierta && (
        <div className="panel-ventana__caja">
          <button type="button" className="panel-ventana__x" aria-label="Cerrar" onClick={onCerrar}>
            <img src={cerrar} alt="" width="12" height="12" />
          </button>
          <header className="panel-ventana__cabecera">
            <div className="panel-ventana__titulo-fila">
              <h2 id="panel-ventana-titulo" className="panel-ventana__titulo" tabIndex={-1}>{titulo}</h2>
              {etiqueta}
            </div>
            {subtitulo && <p className="panel-ventana__subtitulo">{subtitulo}</p>}
          </header>
          <div className="panel-ventana__cuerpo">{children}</div>
          <footer className="panel-ventana__pie">
            {pie ?? (
              <button type="button" className="panel-boton panel-boton--secundario" onClick={onCerrar}>
                Cerrar
              </button>
            )}
          </footer>
        </div>
      )}
    </dialog>
  );
}

export function Cajita({ etiqueta, valor }) {
  return (
    <div className="panel-cajita">
      <p className="panel-cajita__etiqueta">{etiqueta}</p>
      <p className="panel-cajita__valor">{valor ?? <span className="panel-sin-dato">Sin datos</span>}</p>
    </div>
  );
}

export function EstadoCarga({ cargando, error, recargar, vacio }) {
  if (cargando) return <p className="panel-aviso" role="status">Cargando datos…</p>;
  if (error) {
    return (
      <div className="panel-aviso panel-aviso--error" role="alert">
        <p>No se pudieron cargar los datos. Revisa la conexión e inténtalo otra vez.</p>
        <button type="button" className="panel-boton panel-boton--secundario" onClick={recargar}>
          Reintentar
        </button>
      </div>
    );
  }
  if (vacio) return <p className="panel-aviso">Todavía no hay estudiantes registrados.</p>;
  return null;
}
