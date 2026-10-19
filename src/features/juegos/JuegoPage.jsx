import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../app/routes.js';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import { registrarPartida } from '../progreso/repositorio.js';
import { ahora } from '../progreso/reloj.js';
import * as aTodoFoco from './a-todo-foco/ATodoFoco.jsx';
import * as repiteElPatron from './repite-el-patron/RepiteElPatron.jsx';
import * as sigueElPunto from './sigue-el-punto/SigueElPunto.jsx';
import * as encuentraElPar from './encuentra-el-par/EncuentraElPar.jsx';
import * as semaforoAtento from './semaforo-atento/SemaforoAtento.jsx';
import * as cazaFiguras from './caza-figuras/CazaFiguras.jsx';
import { estaDesbloqueado, getJuego } from './catalogo.js';
import { Instrucciones, MarcoJuego, Resultados } from './MarcoJuego.jsx';

const MODULOS = {
  'a-todo-foco': aTodoFoco,
  'repite-el-patron': repiteElPatron,
  'sigue-el-punto': sigueElPunto,
  'encuentra-el-par': encuentraElPar,
  'semaforo-atento': semaforoAtento,
  'caza-figuras': cazaFiguras,
};

const FASE = {
  instructions: 'instrucciones',
  playing: 'jugando',
  results: 'resultados',
};

function Partida({ juego, modulo, uid }) {
  const [fase, setFase] = useState(FASE.instructions);
  const [ronda, setRonda] = useState(0);
  const [inicio, setInicio] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [encabezado, setEncabezado] = useState(null);

  function empezar() {
    setInicio({ fecha: ahora(), ms: performance.now() });
    setRonda((n) => n + 1);
    setEncabezado(null);
    setFase(FASE.playing);
  }

  function terminar(resultado) {
    registrarPartida(uid, {
      juego: juego.id,
      fechaInicio: inicio.fecha,
      duracion: Math.round((performance.now() - inicio.ms) / 1000),
      metricas: resultado,
    });
    setMetricas(resultado);
    setFase(FASE.results);
  }

  const { Jugando } = modulo;
  return (
    <MarcoJuego juego={juego} terminado={fase === FASE.results} estado={fase === FASE.playing ? encabezado : null}>
      {fase === FASE.instructions && <Instrucciones {...modulo.instrucciones} onEmpezar={empezar} />}
      {fase === FASE.playing && <Jugando key={ronda} onTerminar={terminar} onEncabezado={setEncabezado} />}
      {fase === FASE.results && <Resultados {...modulo.resultados(metricas)} onOtraVez={empezar} />}
    </MarcoJuego>
  );
}

export default function JuegoPage() {
  const { juegoId } = useParams();
  const progreso = useProgreso();
  const juego = getJuego(juegoId);
  const modulo = MODULOS[juegoId];

  if (!juego) return <Navigate to={ROUTES.games} replace />;
  if (progreso.cargando || progreso.error) return null;
  if (!modulo || !estaDesbloqueado(juego, progreso.puntosTotales)) return <Navigate to={ROUTES.games} replace />;
  return <Partida key={juego.id} juego={juego} modulo={modulo} uid={progreso.uid} />;
}
