import { CUENTO_IDS, DIAS, getCuento, preguntasPorCuento, puntosPorCuento } from '../contenido/cuentos.js';
import { estaDesbloqueado, juegosDelDia } from '../juegos/catalogo.js';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { cuentosTerminados } from '../progreso/modelo.js';
import { ESTADO_MASCOTA, MENSAJE_FRIO } from '../mascota/estado.js';

export const NOMBRE_DIA = {
  1: 'Tema e idea principal',
  2: 'Pistas del autor',
  3: 'Resumir en tres pasos',
};

export const ESTADO_INICIO = {
  noneDone: 'A',
  oneDone: 'B',
  dayDone: 'C',
  allDone: 'final',
};

const PALABRAS_POR_MINUTO = 150;

export function minutosDeLectura(palabras) {
  return Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));
}

export function numeroDeCuento(cuentoId) {
  return CUENTO_IDS.indexOf(cuentoId) + 1;
}

function estadoInicio(diaActual, registroDia) {
  if (diaActual.estado === ESTADO_DIA.allDone) return ESTADO_INICIO.allDone;
  const terminados = cuentosTerminados(registroDia).length;
  if (terminados >= CUENTO_IDS.length) return ESTADO_INICIO.dayDone;
  return terminados === 1 ? ESTADO_INICIO.oneDone : ESTADO_INICIO.noneDone;
}

function textosEncabezado(estado, dia) {
  if (estado === ESTADO_INICIO.allDone) {
    return {
      titulo: '¡Terminaste las 3 lecturas!',
      descripcion: 'Puedes leer otra vez los cuentos y jugar todos los juegos.',
    };
  }
  if (estado === ESTADO_INICIO.dayDone) {
    return {
      titulo: '¡Terminaste por hoy!',
      descripcion:
        dia === DIAS.at(-1)
          ? 'Terminaste las 3 lecturas. Puedes leer otra vez los cuentos y jugar todos los juegos.'
          : 'Vuelve mañana: leerás los mismos cuentos con preguntas nuevas y se abrirán 2 juegos más.',
    };
  }
  return {
    titulo: 'Lee y responde',
    descripcion: 'Lee cada cuento con calma y responde las preguntas. Si aciertas, ganas puntos y abres un juego.',
  };
}

export function mensajeMascota(estadoMascota, estado, dia) {
  if (estadoMascota === ESTADO_MASCOTA.cold) return MENSAJE_FRIO;
  if (estado === ESTADO_INICIO.allDone || (estado === ESTADO_INICIO.dayDone && dia === DIAS.at(-1))) {
    return '¡Gracias por leer! Ya tengo todo el calor que necesito.';
  }
  if (estado === ESTADO_INICIO.dayDone) return '¡Gracias por leer! Mañana vuelvo a tener frío… ¡te espero!';
  return '¡Gracias! Ya me siento mejor.';
}

function etiquetaSemana(d, diaActual) {
  const { dia, estado } = diaActual;
  if (estado === ESTADO_DIA.allDone || d < dia) return { tipo: 'hecho', texto: 'Hecho ✓' };
  if (d === dia) {
    return estado === ESTADO_DIA.finishedToday
      ? { tipo: 'terminado', texto: 'Terminado ✓' }
      : { tipo: 'hoy', texto: 'Hoy' };
  }
  const faltan = d - dia;
  return { tipo: 'futuro', texto: faltan === 1 ? 'Se abre mañana' : `Se abre en ${faltan} días` };
}

export function vistaInicio({ diaActual, registroDia, puntosTotales }) {
  const { dia } = diaActual;
  const estado = estadoInicio(diaActual, registroDia);
  const terminados = estado === ESTADO_INICIO.allDone ? CUENTO_IDS : cuentosTerminados(registroDia);
  const todoAbierto = estado === ESTADO_INICIO.allDone;

  return {
    estado,
    dia,
    nombreDia: NOMBRE_DIA[dia],
    ...textosEncabezado(estado, dia),
    cuentos: CUENTO_IDS.map((id) => {
      const cuento = getCuento(id);
      return {
        id,
        numero: numeroDeCuento(id),
        titulo: cuento.titulo,
        minutos: minutosDeLectura(cuento.palabras_aprox),
        preguntas: preguntasPorCuento(dia),
        puntos: puntosPorCuento(dia),
        terminado: terminados.includes(id),
      };
    }),
    semana: DIAS.map((d) => ({ dia: d, nombre: NOMBRE_DIA[d], ...etiquetaSemana(d, diaActual) })),
    juegosHoy: juegosDelDia(dia).map((juego) => ({ ...juego, abierto: todoAbierto || estaDesbloqueado(juego, puntosTotales) })),
    otrosDias: DIAS.filter((d) => d !== dia).map((d) => {
      const pasado = todoAbierto || d < dia;
      return {
        dia: d,
        pasado,
        texto: pasado ? 'Ya puedes jugarlos' : 'Vuelve mañana',
        juegos: juegosDelDia(d).map((juego) => ({ ...juego, abierto: pasado && estaDesbloqueado(juego, puntosTotales) })),
      };
    }),
  };
}
