import { DIAS } from '../contenido/cuentos.js';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { estaDesbloqueado, JUEGOS, juegosDelDia } from './catalogo.js';

function cuandoSeAbre(faltan) {
  return faltan === 1 ? 'mañana' : `en ${faltan} días`;
}

export function vistaJuegos({ diaActual, puntosTotales }) {
  const todoTerminado = diaActual.estado === ESTADO_DIA.allDone;
  const columnas = DIAS.map((dia) => {
    const faltan = todoTerminado ? 0 : dia - diaActual.dia;
    const esHoy = !todoTerminado && faltan === 0;
    let etiqueta = `DÍA ${dia}`;
    if (esHoy) etiqueta = `DÍA ${dia} · HOY`;
    else if (faltan > 0) etiqueta = `DÍA ${dia} · SE ABRE ${cuandoSeAbre(faltan).toUpperCase()}`;
    return {
      dia,
      esHoy,
      etiqueta,
      juegos: juegosDelDia(dia).map((juego) => {
        const abierto = estaDesbloqueado(juego, puntosTotales);
        const bloqueo = `Se desbloquea con ${juego.umbral} puntos`;
        return {
          ...juego,
          abierto,
          aviso: abierto ? null : faltan > 0 ? `${bloqueo} · vuelve ${cuandoSeAbre(faltan)}` : bloqueo,
        };
      }),
    };
  });

  const todosAbiertos = JUEGOS.every((juego) => estaDesbloqueado(juego, puntosTotales));
  let aviso = null;
  if (todosAbiertos) {
    aviso = {
      titulo: '¡Abriste todos los juegos!',
      texto: 'Terminaste los 3 días de lectura. Puedes jugar a cualquiera cuando quieras.',
    };
  } else if (!todoTerminado && diaActual.dia < DIAS.at(-1)) {
    aviso = {
      titulo: '¿Quieres jugar a los otros?',
      texto: 'Mañana lees los mismos 2 cuentos con preguntas nuevas, y al responder se abren 2 juegos más. ¡Vuelve mañana!',
    };
  }

  return { columnas, aviso };
}
