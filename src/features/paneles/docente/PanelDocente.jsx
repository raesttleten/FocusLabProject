import { useMemo, useState } from 'react';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import iconoInicio from '../../../assets/paneles/icono-inicio.svg';
import { getJuego } from '../../juegos/catalogo.js';
import { useAhora } from '../../progreso/useAhora.js';
import PanelLayout from '../PanelLayout.jsx';
import { Barra, Cajita, Chip, Dato, EstadoCarga, FiltroDias, Tarjeta, Ventana } from '../componentes.jsx';
import { duracion, fechaDeHoy, momento, porcentaje } from '../formato.js';
import { detalleDocente, filaDocente, nombrePeriodo, resumenDocente, TODO } from '../indicadores.js';
import { usePanelDatos } from '../usePanelDatos.js';

const intentos = (n) => (n === 1 ? '1 intento' : `${n} intentos`);

function textoIntentos(p) {
  if (!p.intentos) return 'sin responder';
  if (p.opinion) return p.completada ? 'opinión' : 'sin responder';
  return p.completada ? intentos(p.intentos) : `${intentos(p.intentos)}, sin acertar`;
}

const textoPeriodo = (periodo) => (periodo === TODO ? 'todo el piloto' : nombrePeriodo(periodo).toLowerCase());

function DetalleEstudiante({ estudiante, ahora, onCerrar }) {
  const fila = filaDocente(estudiante, TODO, ahora);
  const dias = detalleDocente(estudiante);
  const partidas = estudiante.juegos.length;

  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      ancho={820}
      titulo={estudiante.codigo}
      etiqueta={<Chip estado={fila.diaEnQueVa.estado}>{fila.diaEnQueVa.texto}</Chip>}
      subtitulo={`Último ingreso: ${momento(fila.ultimoIngreso, ahora) ?? 'todavía no ha entrado'}`}
    >
      <div className="panel-cajitas">
        <Cajita etiqueta="Cuentos terminados" valor={`${fila.cuentosTerminados} / ${fila.cuentosPosibles}`} />
        <Cajita etiqueta="Aciertos al primer intento" valor={porcentaje(fila.primerIntento.porcentaje)} />
        <Cajita etiqueta="Tiempo de lectura" valor={duracion(fila.segundosLectura)} />
        <Cajita etiqueta="Juegos jugados" valor={String(partidas)} />
      </div>

      {dias.map((dia) => (
        <section key={dia.dia} className="panel-dia">
          <h3 className="panel-dia__titulo">
            Día {dia.dia} <span>{dia.componente}</span>
          </h3>
          {!dia.empezado ? (
            <p className="panel-dia__vacio">Todavía no empieza este día.</p>
          ) : (
            <>
              <table className="panel-tabla panel-tabla--compacta">
                <thead>
                  <tr>
                    <th scope="col">Cuento</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Tiempo de lectura</th>
                    <th scope="col">Intentos por pregunta</th>
                  </tr>
                </thead>
                <tbody>
                  {dia.cuentos.map((cuento) => (
                    <tr key={cuento.cuento}>
                      <td className="panel-nowrap">Cuento {cuento.cuento.slice(1)}</td>
                      <td>{cuento.terminado ? 'Terminado' : 'Pendiente'}</td>
                      <td>
                        <Dato valor={duracion(cuento.segundosLectura)} />
                      </td>
                      <td>
                        <ul className="panel-intentos">
                          {cuento.preguntas.map((p) => (
                            <li key={p.indice} className={p.completada ? '' : 'pendiente'}>
                              <span className="panel-intentos__n">P{p.indice + 1}:</span>
                              {textoIntentos(p)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="panel-dia__juegos">
                <strong>Juegos jugados:</strong>{' '}
                {dia.juegos.length
                  ? dia.juegos.map((j) => `${getJuego(j.juego)?.nombre ?? j.juego} (${j.partidas})`).join(', ')
                  : 'ninguno'}
              </p>
            </>
          )}
        </section>
      ))}
    </Ventana>
  );
}

export default function PanelDocente() {
  const { profile } = useAuth();
  const ahora = useAhora();
  const { cargando, error, estudiantes, recargar } = usePanelDatos({ grupoId: profile.grupoId });
  const [periodo, setPeriodo] = useState(TODO);
  const [seleccion, setSeleccion] = useState(null);

  const resumen = useMemo(() => resumenDocente(estudiantes, periodo, ahora), [estudiantes, periodo, ahora]);
  const filas = useMemo(() => estudiantes.map((e) => filaDocente(e, periodo, ahora)), [estudiantes, periodo, ahora]);
  const seleccionado = estudiantes.find((e) => e.uid === seleccion);
  const listo = !cargando && !error && estudiantes.length > 0;

  return (
    <PanelLayout
      icono={iconoInicio}
      etiquetaIcono="Inicio"
      titulo="Hola, profe"
      subtitulo={`${listo ? `${resumen.total} estudiantes, ` : ''}${fechaDeHoy(ahora)}`}
    >
      <EstadoCarga cargando={cargando} error={error} recargar={recargar} vacio={!estudiantes.length} />
      {listo && (
        <>
          <div className="panel-tarjetas">
            <Tarjeta
              etiqueta="Estudiantes activos hoy"
              valor={`${resumen.activosHoy} / ${resumen.total}`}
              detalle={resumen.total - resumen.activosHoy === 1 ? '1 aún no ha entrado' : `${resumen.total - resumen.activosHoy} aún no han entrado`}
            />
            <Tarjeta
              etiqueta="Cuentos terminados hoy"
              valor={`${resumen.cuentosHoy} / ${resumen.cuentosPosiblesHoy}`}
              detalle="2 cuentos por estudiante"
            />
            <Tarjeta
              etiqueta="Aciertos al primer intento"
              valor={porcentaje(resumen.primerIntento.porcentaje)}
              detalle={`promedio del grupo, ${textoPeriodo(periodo)}`}
            />
            <Tarjeta
              etiqueta="Tiempo promedio de lectura"
              valor={duracion(resumen.lecturaPromedio)}
              detalle={`min por cuento, ${textoPeriodo(periodo)}`}
            />
          </div>

          <section className="panel-card">
            <header className="panel-card__cabecera">
              <div>
                <h2 className="panel-card__titulo">Progreso del grupo</h2>
                <p className="panel-card__subtitulo">Toca una fila para ver el detalle del estudiante.</p>
              </div>
              <FiltroDias valor={periodo} onCambiar={setPeriodo} />
            </header>
            <div className="panel-tabla-scroll">
              <table className="panel-tabla">
                <thead>
                  <tr>
                    <th scope="col">Estudiante</th>
                    <th scope="col">Día en que va</th>
                    <th scope="col">Cuentos terminados</th>
                    <th scope="col">Puntos</th>
                    <th scope="col">Aciertos al primer intento</th>
                    <th scope="col">Tiempo de lectura</th>
                    <th scope="col">Último ingreso</th>
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
                      <td>
                        <span className="panel-codigo">
                          <span className="panel-codigo__circulo" aria-hidden="true">{fila.codigo.slice(1)}</span>
                          {fila.codigo}
                        </span>
                      </td>
                      <td>
                        <Chip estado={fila.diaEnQueVa.estado}>{fila.diaEnQueVa.texto}</Chip>
                      </td>
                      <td>
                        <span className="panel-progreso">
                          <Barra
                            valor={fila.cuentosTerminados}
                            maximo={fila.cuentosPosibles}
                            tono={fila.cuentosTerminados === fila.cuentosPosibles ? 'exito' : 'principal'}
                          />
                          <span className="panel-progreso__texto">{fila.cuentosTerminados}/{fila.cuentosPosibles}</span>
                        </span>
                      </td>
                      <td className="panel-num">{fila.puntos}</td>
                      <td className="panel-num panel-fuerte">
                        <Dato valor={porcentaje(fila.primerIntento.porcentaje)} />
                      </td>
                      <td className="panel-num">
                        <Dato valor={fila.segundosLectura ? duracion(fila.segundosLectura) : null} />
                      </td>
                      <td className="panel-suave">{momento(fila.ultimoIngreso, ahora) ?? 'Nunca'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      {seleccionado && <DetalleEstudiante estudiante={seleccionado} ahora={ahora} onCerrar={() => setSeleccion(null)} />}
    </PanelLayout>
  );
}
