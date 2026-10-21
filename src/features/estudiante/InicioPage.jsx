import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, routeTo } from '../../app/routes.js';
import candado from '../../assets/estudiante/candado.svg';
import { PORTADAS } from '../contenido/portadas.js';
import MiniaturaJuego from '../juegos/MiniaturaJuego.jsx';
import Mascota from '../mascota/Mascota.jsx';
import PersonalizarMascota from '../mascota/PersonalizarMascota.jsx';
import { estadoMascota, PANTALLA } from '../mascota/estado.js';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import EstudianteLayout from './EstudianteLayout.jsx';
import { mensajeMascota, vistaInicio } from './vistaInicio.js';
import './InicioPage.css';

function Candado() {
  return <img className="inicio-candado" src={candado} alt="" width="16" height="18" />;
}

function TarjetaCuento({ cuento }) {
  const destino = routeTo(ROUTES.reading, { cuentoId: cuento.id });
  return (
    <article className="cuento-tarjeta">
      <img className="cuento-tarjeta__portada" src={PORTADAS[cuento.id]} alt="" width="148" height="148" />
      <div className="cuento-tarjeta__info">
        <p className="student-overline">Cuento {cuento.numero}</p>
        <h3 className="cuento-tarjeta__titulo">{cuento.titulo}</h3>
        <p className="cuento-tarjeta__detalle">
          ≈ {cuento.minutos} minutos de lectura · {cuento.preguntas} preguntas · +{cuento.puntos} puntos
        </p>
        <span className={`cuento-estado${cuento.terminado ? ' cuento-estado--hecho' : ''}`}>
          {cuento.terminado ? `Hecho · +${cuento.puntos} puntos` : 'Por leer'}
        </span>
      </div>
      {cuento.terminado ? (
        <Link className="student-button student-button--secondary cuento-tarjeta__boton" to={destino} state={{ repaso: true }}>
          Leer otra vez
        </Link>
      ) : (
        <Link className="student-button cuento-tarjeta__boton" to={destino}>
          Leer
        </Link>
      )}
    </article>
  );
}

function DiaSemana({ item }) {
  return (
    <div className={`semana-dia semana-dia--${item.tipo}`}>
      <p className="semana-dia__nombre">Día {item.dia}</p>
      <p className="semana-dia__tema">{item.nombre}</p>
      <p className="semana-dia__estado">
        {item.tipo === 'futuro' && <Candado />}
        {item.texto}
      </p>
    </div>
  );
}

function FilaJuego({ juego }) {
  return (
    <div className={`juego-fila${juego.abierto ? '' : ' juego-fila--bloqueado'}`}>
      <MiniaturaJuego id={juego.id} abierto={juego.abierto} />
      <div className="juego-fila__info">
        <p className="juego-fila__nombre">{juego.nombre}</p>
        <p className="juego-fila__detalle">Se desbloquea con {juego.umbral} puntos</p>
      </div>
      {juego.abierto ? (
        <Link className="student-button juego-fila__jugar" to={routeTo(ROUTES.game, { juegoId: juego.id })}>
          Jugar
        </Link>
      ) : (
        <Candado />
      )}
    </div>
  );
}

export default function InicioPage() {
  const progreso = useProgreso();
  const [personalizando, setPersonalizando] = useState(false);

  if (progreso.cargando || progreso.error) {
    return (
      <EstudianteLayout titulo="¡Hola!">
        <p className="inicio-cargando" role="status">
          {progreso.error ? 'No pudimos cargar tu progreso. Vuelve a intentarlo.' : 'Cargando…'}
        </p>
      </EstudianteLayout>
    );
  }

  const vista = vistaInicio(progreso);
  const estado = estadoMascota({
    pantalla: PANTALLA.home,
    puntosHoy: progreso.puntosHoy,
    todoTerminado: progreso.todoTerminado,
  });

  return (
    <EstudianteLayout titulo="¡Hola!" subtitulo={`Día ${vista.dia} de 3 · ${vista.nombreDia}`}>
      <div className="inicio" data-estado={vista.estado}>
        <section className="student-card inicio-cuentos" aria-labelledby="inicio-titulo">
          <span className="student-chip">CUENTOS DE HOY · DÍA {vista.dia}</span>
          <h2 id="inicio-titulo" className="inicio-cuentos__titulo">
            {vista.titulo}
          </h2>
          <p className="inicio-cuentos__descripcion">{vista.descripcion}</p>
          <div className="inicio-cuentos__lista">
            {vista.cuentos.map((cuento) => (
              <TarjetaCuento key={cuento.id} cuento={cuento} />
            ))}
          </div>
          <p className="student-overline inicio-semana__titulo">Tu semana de lectura</p>
          <div className="inicio-semana">
            {vista.semana.map((item) => (
              <DiaSemana key={item.dia} item={item} />
            ))}
          </div>
        </section>

        <aside className="inicio-lateral">
          <section className="student-card inicio-mascota" aria-label="Tu mascota">
            <Mascota estado={estado} tamano={240} />
            <p className="inicio-mascota__mensaje">{mensajeMascota(estado, vista.estado, vista.dia)}</p>
            <button
              type="button"
              className="student-button student-button--secondary inicio-mascota__boton"
              aria-haspopup="dialog"
              onClick={() => setPersonalizando(true)}
            >
              Personalizar mascota
            </button>
            <PersonalizarMascota abierto={personalizando} onCerrar={() => setPersonalizando(false)} />
          </section>

          <section className="student-card inicio-juegos" aria-labelledby="inicio-juegos-titulo">
            <p id="inicio-juegos-titulo" className="student-overline">
              Juegos de hoy
            </p>
            <p className="inicio-juegos__descripcion">Responde los cuentos para ganar puntos y desbloquearlos.</p>
            <div className="inicio-juegos__lista">
              {vista.juegosHoy.map((juego) => (
                <FilaJuego key={juego.id} juego={juego} />
              ))}
            </div>
            <p className="student-overline inicio-otros__titulo">Otros días</p>
            <ul className="inicio-otros">
              {vista.otrosDias.map((otro) => (
                <li key={otro.dia} className={`inicio-otros__dia${otro.pasado ? '' : ' inicio-otros__dia--futuro'}`}>
                  <span>Día {otro.dia}</span>
                  <span className="inicio-otros__texto">
                    {!otro.pasado && <Candado />}
                    {otro.texto}
                  </span>
                </li>
              ))}
            </ul>
            <Link className="student-button student-button--secondary inicio-juegos__todos" to={ROUTES.games}>
              Ver todos los juegos
            </Link>
          </section>
        </aside>
      </div>
    </EstudianteLayout>
  );
}
