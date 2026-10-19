import contenido from '../../data/cuentos.json';

export const DIAS = [1, 2, 3];
export const CUENTO_IDS = ['c1', 'c2'];
export const PUNTOS_POR_RESPUESTA = 10;

export function validarContenido(datos) {
  const errores = [];
  for (const dia of DIAS) {
    const infoDia = datos.dias?.find((d) => d.dia === dia);
    if (!infoDia) errores.push(`Falta el día ${dia} en "dias"`);
    else if (!Array.isArray(infoDia.explicacion) || infoDia.explicacion.length === 0) {
      errores.push(`El día ${dia} no tiene "explicacion"`);
    }
  }
  for (const id of CUENTO_IDS) {
    const cuento = datos.cuentos?.find((c) => c.id === id);
    if (!cuento) {
      errores.push(`Falta el cuento ${id}`);
      continue;
    }
    if (!Array.isArray(cuento.parrafos) || cuento.parrafos.length === 0) {
      errores.push(`El cuento ${id} no tiene párrafos`);
    }
    for (const dia of DIAS) {
      const preguntas = cuento.preguntas?.[String(dia)];
      if (!Array.isArray(preguntas) || preguntas.length === 0) {
        errores.push(`El cuento ${id} no tiene preguntas del día ${dia}`);
        continue;
      }
      preguntas.forEach((pregunta, indice) => {
        const ref = `${id}, día ${dia}, pregunta ${indice + 1}`;
        if (!pregunta.enunciado) errores.push(`${ref}: falta "enunciado"`);
        if (!pregunta.pista) errores.push(`${ref}: falta "pista"`);
        if (!pregunta.tipo) errores.push(`${ref}: falta "tipo"`);
        if (!Array.isArray(pregunta.opciones) || pregunta.opciones.length !== 4) {
          errores.push(`${ref}: debe tener 4 opciones`);
        }
        const { correcta } = pregunta;
        const correctaValida =
          correcta === null || (Number.isInteger(correcta) && correcta >= 0 && correcta <= 3);
        if (!correctaValida) errores.push(`${ref}: "correcta" debe ser 0 a 3 o null`);
      });
    }
    const cantidades = DIAS.map((dia) => cuento.preguntas?.[String(dia)]?.length);
    const otro = datos.cuentos.find((c) => c.id !== id);
    if (otro && DIAS.some((dia, i) => otro.preguntas?.[String(dia)]?.length !== cantidades[i])) {
      errores.push('Los dos cuentos deben tener la misma cantidad de preguntas cada día');
    }
  }
  return [...new Set(errores)];
}

const errores = validarContenido(contenido);
if (errores.length > 0) {
  throw new Error(`src/data/cuentos.json no es válido:\n${errores.join('\n')}`);
}

export function getDia(dia) {
  return contenido.dias.find((d) => d.dia === dia);
}

export function getCuentos() {
  return CUENTO_IDS.map((id) => contenido.cuentos.find((c) => c.id === id));
}

export function getCuento(id) {
  return contenido.cuentos.find((c) => c.id === id);
}

export function getPreguntas(cuentoId, dia) {
  return getCuento(cuentoId).preguntas[String(dia)];
}

export function preguntasPorCuento(dia) {
  return getPreguntas(CUENTO_IDS[0], dia).length;
}

export function puntosPorCuento(dia) {
  return preguntasPorCuento(dia) * PUNTOS_POR_RESPUESTA;
}

export function puntosPosibles() {
  return DIAS.reduce((total, dia) => total + puntosPorCuento(dia) * CUENTO_IDS.length, 0);
}

export function esOpinion(pregunta) {
  return pregunta.correcta === null;
}

export function respuestaId(dia, cuentoId, indice) {
  return `${dia}_${cuentoId}_${indice}`;
}

export function segmentarResaltado(texto) {
  return texto
    .split(/==(.+?)==/)
    .map((parte, i) => ({ texto: parte, resaltado: i % 2 === 1 }))
    .filter((segmento) => segmento.texto !== '');
}
