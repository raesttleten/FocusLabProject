import { useMemo, useState } from 'react';
import iconoResumen from '../../../assets/paneles/icono-resumen.svg';
import iconoDescargar from '../../../assets/paneles/icono-descargar.svg';
import flechaAbajo from '../../../assets/paneles/flecha-abajo.svg';
import { getJuego } from '../../juegos/catalogo.js';
import { metricasComunes } from '../../juegos/metricasComunes.js';
import { useAhora } from '../../progreso/useAhora.js';
import PanelLayout from '../PanelLayout.jsx';
import { Cajita, Dato, EstadoCarga, Tarjeta, Ventana } from '../componentes.jsx';
import { decimal, duracion, milisegundos, porcentaje } from '../formato.js';
import {
  COMPONENTE_CORTO,
  detalleInvestigadora,
  diaDeEstudio,
  filaInvestigadora,
  nombrePeriodo,
  PERIODOS,
  resumenInvestigadora,
  TODO,
} from '../indicadores.js';
import { usePanelDatos } from '../usePanelDatos.js';
import ExportarCsv from './ExportarCsv.jsx';

const COLOR_ACTIVO = 'var(--panel-primario)';
const COLOR_INACTIVO = 'var(--panel-inactivo)';
const textoPeriodo = (periodo) => (periodo === TODO ? 'todo el piloto' : nombrePeriodo(periodo).toLowerCase());
const minutos = (segundos) => `${duracion(segundos)} min`;

function SelectorPeriodo({ valor, onCambiar }) {
  return (
    <label className="panel-selector">
      <span className="panel-oculto">Periodo</span>
      <select value={String(valor)} onChange={(event) => onCambiar(event.target.value === TODO ? TODO : Number(event.target.value))}>
        {PERIODOS.map((periodo) => (
          <option key={periodo} value={String(periodo)}>
            {periodo === TODO ? 'Todo el piloto' : nombrePeriodo(periodo)}
          </option>
        ))}
      </select>
      <img src={flechaAbajo} alt="" width="12" height="8" />
    </label>
  );
}

function GraficaComponentes({ porComponente, periodo }) {
  return (
    <section className="panel-card panel-card--grafica">
      <header className="panel-card__cabecera">
        <div>
          <h2 className="panel-card__titulo">Aciertos al primer intento por componente</h2>
          <p className="panel-card__subtitulo">Cada día trabaja un componente, todo el grupo</p>
        </div>
      </header>
      <div className="panel-columnas" role="list">
        {porComponente.map((c) => {
          const tenue = periodo !== TODO && periodo !== c.dia;
          return (
            <div key={c.dia} className={`panel-columna${tenue ? ' panel-columna--tenue' : ''}`} role="listitem">
              <span className="panel-columna__valor">{porcentaje(c.porcentaje) ?? 'Sin datos'}</span>
              <span className="panel-columna__pista">
                <span className="panel-columna__barra" style={{ height: `${c.porcentaje ?? 0}%` }} />
              </span>
              <span className="panel-columna__dia">Día {c.dia}</span>
              <span className="panel-columna__nombre">{COMPONENTE_CORTO[c.dia]}</span>
              <span className="panel-columna__total">{c.total ? `${c.aciertos} de ${c.total} respuestas` : 'sin respuestas'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DistribucionTiempo({ segundosActivos, segundosInactivos, salidas, periodo }) {
  const total = segundosActivos + segundosInactivos;
  const pctActivo = total ? (segundosActivos / total) * 100 : null;
  const fondo = total
    ? `conic-gradient(${COLOR_ACTIVO} 0 ${pctActivo}%, ${COLOR_INACTIVO} ${pctActivo}% 100%)`
    : 'var(--panel-pista)';
  return (
    <section className="panel-card panel-card--tiempo">
      <h2 className="panel-card__titulo">¿En qué se va el tiempo?</h2>
      <p className="panel-card__subtitulo">Todo el grupo, {textoPeriodo(periodo)}</p>
      <div className="panel-dona-fila">
        <div className="panel-dona" style={{ background: fondo }}>
          <div className="panel-dona__centro">
            <strong>{porcentaje(pctActivo) ?? 'Sin datos'}</strong>
            <span>activo</span>
          </div>
        </div>
        <ul className="panel-leyenda">
          <li>
            <span className="panel-leyenda__color" style={{ background: COLOR_ACTIVO }} />
            <span>
              Activo<small>{minutos(segundosActivos)}</small>
            </span>
            <strong>{porcentaje(pctActivo) ?? ''}</strong>
          </li>
          <li>
            <span className="panel-leyenda__color" style={{ background: COLOR_INACTIVO }} />
            <span>
              Inactivo<small>{minutos(segundosInactivos)}</small>
            </span>
            <strong>{pctActivo == null ? '' : porcentaje(100 - pctActivo)}</strong>
          </li>
          <li>
            <span className="panel-leyenda__color panel-leyenda__color--salida" />
            <span>Salidas de la app</span>
            <strong>{salidas}</strong>
          </li>
        </ul>
      </div>
      <p className="panel-card__nota">
        Inactivo: 60 segundos sin toques, teclas ni scroll, o con la pestaña oculta.
        <br />
        Salida: la pestaña estuvo oculta más de 5 minutos.
      </p>
    </section>
  );
}

function DetalleEstudiante({ estudiante, periodo, onCerrar }) {
  const { fila, respuestas, juegos } = detalleInvestigadora(estudiante, periodo);
  const lecturas = estudiante.lecturas.filter((l) => periodo === TODO || l.dia === periodo);
  const conActividad = fila.segundosActivos + fila.segundosInactivos > 0;

  return (
    <Ventana abierta onCerrar={onCerrar} ancho={960} titulo={estudiante.codigo} subtitulo={`Detalle por pregunta, ${textoPeriodo(periodo)}`}>
      <div className="panel-cajitas">
        <Cajita etiqueta="Días terminados" valor={`${fila.diasTerminados} / ${fila.diasPosibles}`} />
        <Cajita etiqueta="Aciertos al primer intento" valor={porcentaje(fila.primerIntento.porcentaje)} />
        <Cajita etiqueta="Tiempo activo" valor={conActividad ? minutos(fila.segundosActivos) : null} />
        <Cajita etiqueta="Tiempo inactivo" valor={conActividad ? minutos(fila.segundosInactivos) : null} />
        <Cajita etiqueta="Salió de la app" valor={conActividad ? (fila.salidas === 1 ? '1 vez' : `${fila.salidas} veces`) : null} />
      </div>

      <h3 className="panel-seccion">Respuestas</h3>
      <div className="panel-tabla-scroll">
        <table className="panel-tabla panel-tabla--compacta">
          <thead>
            <tr>
              <th scope="col">Día</th>
              <th scope="col">Componente</th>
              <th scope="col">Cuento</th>
              <th scope="col">Pregunta</th>
              <th scope="col">Intentos</th>
              <th scope="col">Acertó en el intento</th>
              <th scope="col">Segundos hasta acertar</th>
              <th scope="col">Opciones tocadas</th>
            </tr>
          </thead>
          <tbody>
            {respuestas.map((r) => (
              <tr key={`${r.dia}_${r.cuento}_${r.indice}`} className={r.intentos ? '' : 'panel-fila--pendiente'}>
                <td>{r.dia}</td>
                <td>{COMPONENTE_CORTO[r.dia]}</td>
                <td className="panel-nowrap">Cuento {r.cuento.slice(1)}</td>
                <td>
                  P{r.indice + 1}, {r.tipo}
                </td>
                <td className="panel-num">{r.intentos || <span className="panel-sin-dato">Sin responder</span>}</td>
                <td className="panel-num">{r.opinion ? 'Opinión' : <Dato valor={r.aciertoEnIntento} />}</td>
                <td className="panel-num">
                  <Dato valor={r.completada ? r.segundosHastaAcertar : null} />
                </td>
                <td>{r.opciones.length ? r.opciones.join(', ').toUpperCase() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="panel-seccion">Lecturas</h3>
      {lecturas.length ? (
        <table className="panel-tabla panel-tabla--compacta">
          <thead>
            <tr>
              <th scope="col">Día</th>
              <th scope="col">Cuento</th>
              <th scope="col">Modo</th>
              <th scope="col">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {lecturas.map((l, i) => (
              <tr key={i}>
                <td>{l.dia}</td>
                <td className="panel-nowrap">Cuento {l.cuento.slice(1)}</td>
                <td>{l.modo === 'repaso' ? 'Repaso' : 'Primera vez'}</td>
                <td className="panel-num">{duracion(l.segundos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="panel-dia__vacio">Sin lecturas en este periodo.</p>
      )}

      <h3 className="panel-seccion">Partidas</h3>
      {juegos.length ? (
        <div className="panel-tabla-scroll">
          <table className="panel-tabla panel-tabla--compacta">
            <thead>
              <tr>
                <th scope="col">Juego</th>
                <th scope="col">Día</th>
                <th scope="col">Duración</th>
                <th scope="col">Aciertos</th>
                <th scope="col">Errores</th>
                <th scope="col">Omisiones</th>
                <th scope="col">Tiempo de reacción</th>
              </tr>
            </thead>
            <tbody>
              {juegos.map((j, i) => {
                const m = metricasComunes(j);
                return (
                  <tr key={i}>
                    <td>{getJuego(j.juego)?.nombre ?? j.juego}</td>
                    <td>{diaDeEstudio(estudiante.dias, j.fechaInicio) ?? ''}</td>
                    <td className="panel-num">{duracion(j.duracion)}</td>
                    <td className="panel-num"><Dato valor={m.aciertos} /></td>
                    <td className="panel-num"><Dato valor={m.errores} /></td>
                    <td className="panel-num"><Dato valor={m.omisiones} /></td>
                    <td className="panel-num"><Dato valor={milisegundos(m.tiempoReaccionMs)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="panel-dia__vacio">Sin partidas en este periodo.</p>
      )}
    </Ventana>
  );
}

export default function PanelInvestigadora() {
  const ahora = useAhora();
  const { cargando, error, estudiantes, recargar } = usePanelDatos();
  const [periodo, setPeriodo] = useState(TODO);
  const [seleccion, setSeleccion] = useState(null);
  const [exportando, setExportando] = useState(false);

  const resumen = useMemo(() => resumenInvestigadora(estudiantes, periodo), [estudiantes, periodo]);
  const filas = useMemo(() => estudiantes.map((e) => filaInvestigadora(e, periodo)), [estudiantes, periodo]);
  const seleccionado = estudiantes.find((e) => e.uid === seleccion);
  const listo = !cargando && !error && estudiantes.length > 0;
  const diasPosibles = estudiantes.length * (periodo === TODO ? 3 : 1);

  return (
    <PanelLayout
      icono={iconoResumen}
      etiquetaIcono="Resumen"
      titulo="Resumen"
      subtitulo={`Piloto de comprensión lectora, 3 días${listo ? `, ${resumen.total} estudiantes` : ''}`}
      acciones={
        <>
          <SelectorPeriodo valor={periodo} onCambiar={setPeriodo} />
          <button type="button" className="panel-boton panel-boton--exportar" disabled={!listo} onClick={() => setExportando(true)}>
            <img src={iconoDescargar} alt="" width="18" height="18" />
            Exportar CSV
          </button>
        </>
      }
    >
      <EstadoCarga cargando={cargando} error={error} recargar={recargar} vacio={!estudiantes.length} />
      {listo && (
        <>
          <div className="panel-tarjetas">
            <Tarjeta
              etiqueta="Participantes con al menos un día terminado"
              valor={`${resumen.participantes} / ${resumen.total}`}
              detalle="estudiantes registrados"
            />
            <Tarjeta etiqueta="Días completados" valor={`${resumen.diasCompletados} / ${diasPosibles}`} detalle={`en total, ${textoPeriodo(periodo)}`} />
            <Tarjeta
              etiqueta="Aciertos al primer intento"
              valor={porcentaje(resumen.primerIntento.porcentaje)}
              detalle={`${resumen.primerIntento.aciertos} de ${resumen.primerIntento.total} preguntas con respuesta correcta`}
            />
            <Tarjeta etiqueta="Tiempo promedio de lectura por cuento" valor={duracion(resumen.lecturaPromedio)} detalle="min, primera lectura" />
          </div>

          <div className="panel-fila-cards">
            <GraficaComponentes porComponente={resumen.porComponente} periodo={periodo} />
            <DistribucionTiempo {...resumen} periodo={periodo} />
          </div>

          <section className="panel-card">
            <header className="panel-card__cabecera">
              <div>
                <h2 className="panel-card__titulo">Detalle por estudiante</h2>
                <p className="panel-card__subtitulo">Toca una fila para ver cada pregunta, {textoPeriodo(periodo)}.</p>
              </div>
            </header>
            <div className="panel-tabla-scroll">
              <table className="panel-tabla panel-tabla--ancha">
                <thead>
                  <tr className="panel-tabla__grupos">
                    <th colSpan={2} />
                    <th colSpan={3} scope="colgroup">Aciertos al primer intento</th>
                    <th colSpan={4} />
                    <th colSpan={5} scope="colgroup">Juegos (promedio por partida)</th>
                  </tr>
                  <tr>
                    <th scope="col">Estudiante</th>
                    <th scope="col">Días terminados</th>
                    {[1, 2, 3].map((dia) => (
                      <th key={dia} scope="col">{COMPONENTE_CORTO[dia]}</th>
                    ))}
                    <th scope="col">Promedio de intentos</th>
                    <th scope="col">Tiempo de lectura</th>
                    <th scope="col">Activo</th>
                    <th scope="col">Inactivo</th>
                    <th scope="col">Partidas</th>
                    <th scope="col">Aciertos</th>
                    <th scope="col">Errores</th>
                    <th scope="col">Omisiones</th>
                    <th scope="col">Tiempo de reacción</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila) => (
                    <tr
                      key={fila.uid}
                      className="panel-fila"
                      tabIndex={0}
                      onClick={() => setSeleccion(fila.uid)}
                      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && (event.preventDefault(), setSeleccion(fila.uid))}
                      aria-label={`Ver detalle de ${fila.codigo}`}
                    >
                      <td className="panel-fuerte">{fila.codigo}</td>
                      <td>
                        {fila.diasTerminados} de {fila.diasPosibles}
                      </td>
                      {fila.porComponente.map((c) => (
                        <td key={c.dia} className="panel-num">
                          <Dato valor={porcentaje(c.porcentaje)} />
                        </td>
                      ))}
                      <td className="panel-num"><Dato valor={decimal(fila.promedioIntentos)} /></td>
                      <td className="panel-num"><Dato valor={fila.segundosLectura ? duracion(fila.segundosLectura) : null} /></td>
                      <td className="panel-num"><Dato valor={fila.segundosActivos ? duracion(fila.segundosActivos) : null} /></td>
                      <td className="panel-num"><Dato valor={fila.segundosActivos || fila.segundosInactivos ? duracion(fila.segundosInactivos) : null} /></td>
                      <td className="panel-num">{fila.partidas}</td>
                      <td className="panel-num"><Dato valor={decimal(fila.juegos.aciertos)} /></td>
                      <td className="panel-num"><Dato valor={decimal(fila.juegos.errores)} /></td>
                      <td className="panel-num"><Dato valor={decimal(fila.juegos.omisiones)} /></td>
                      <td className="panel-num"><Dato valor={milisegundos(fila.juegos.tiempoReaccionMs)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      {seleccionado && <DetalleEstudiante estudiante={seleccionado} periodo={periodo} onCerrar={() => setSeleccion(null)} />}
      {exportando && <ExportarCsv estudiantes={estudiantes} periodo={periodo} ahora={ahora} onCerrar={() => setExportando(false)} />}
    </PanelLayout>
  );
}
