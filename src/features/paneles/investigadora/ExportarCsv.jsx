import { useState } from 'react';
import { fechaColombia } from '../../progreso/fechas.js';
import { Ventana } from '../componentes.jsx';
import { aCsv, ARCHIVOS } from '../csv.js';
import { filtrarPeriodo, nombrePeriodo, TODO } from '../indicadores.js';

function descargar(nombre, contenido) {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ExportarCsv({ estudiantes, periodo, ahora, onCerrar }) {
  const [elegidos, setElegidos] = useState(() => new Set(ARCHIVOS.map((a) => a.id)));
  const filtrados = estudiantes.map((e) => filtrarPeriodo(e, periodo));
  const conteos = Object.fromEntries(ARCHIVOS.map((a) => [a.id, a.filas(filtrados).length]));
  const sufijo = `${periodo === TODO ? 'todo' : `dia${periodo}`}_${fechaColombia(ahora)}`;

  function alternar(id) {
    setElegidos((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function exportar() {
    for (const archivo of ARCHIVOS) {
      if (!elegidos.has(archivo.id)) continue;
      descargar(`focuslap_${archivo.id}_${sufijo}.csv`, aCsv(archivo.columnas, archivo.filas(filtrados)));
    }
    onCerrar();
  }

  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      ancho={640}
      titulo="Exportar datos del piloto"
      subtitulo="Archivos CSV compatibles con SPSS, JASP y R."
      pie={
        <>
          <button type="button" className="panel-boton panel-boton--secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className="panel-boton" disabled={elegidos.size === 0} onClick={exportar}>
            Descargar CSV
          </button>
        </>
      }
    >
      <fieldset className="panel-exportar">
        <legend className="panel-exportar__titulo">Archivos incluidos</legend>
        {ARCHIVOS.map((archivo) => (
          <label key={archivo.id} className="panel-check">
            <input type="checkbox" checked={elegidos.has(archivo.id)} onChange={() => alternar(archivo.id)} />
            <span className="panel-check__caja" aria-hidden="true">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1.5 5.2L4.4 8L10.5 1.8" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>
              <span className="panel-check__nombre">{archivo.nombre}</span>
              <span className="panel-check__detalle">
                {archivo.detalle}, {conteos[archivo.id]} {conteos[archivo.id] === 1 ? 'fila' : 'filas'}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="panel-nota">
        Los datos se exportan solo con códigos anónimos (E01 a E28), sin nombres ni información personal identificable.
      </p>
      <p className="panel-ventana__periodo">
        Periodo: {periodo === TODO ? 'todo el piloto' : nombrePeriodo(periodo)}, {estudiantes.length} estudiantes.
      </p>
    </Ventana>
  );
}
