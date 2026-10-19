export const PRENDAS = ['lila', 'rosa', 'negro', 'verde'];
export const PRENDA_POR_DEFECTO = 'lila';
export const NOMBRE_POR_DEFECTO = 'Lumi';
export const NOMBRE_MAXIMO = 12;
export const MENSAJE_FRIO = '¡Brrr, tengo frío! Lee un cuento para darme calor.';

export const ESTADO_MASCOTA = {
  cold: 'frio',
  calm: 'tranquila',
  transition: 'transicion',
  happy: 'feliz',
};

export const PANTALLA = {
  home: 'inicio',
  success: 'logrado',
  customize: 'personalizar',
};

export const LUZ_FRIO = 0.3;
export const LUZ_CALOR = 1;

export function validarNombreMascota(nombre) {
  const limpio = (nombre ?? '').trim();
  const largo = [...limpio].length;
  return { nombre: limpio, valido: largo >= 1 && largo <= NOMBRE_MAXIMO };
}

export function normalizarMascota(mascota) {
  const { nombre, valido } = validarNombreMascota(mascota?.nombre);
  return {
    nombre: valido ? nombre : NOMBRE_POR_DEFECTO,
    prenda: PRENDAS.includes(mascota?.prenda) ? mascota.prenda : PRENDA_POR_DEFECTO,
  };
}

export function estadoMascota({ pantalla, puntosHoy, mostrarTransicion = false, todoTerminado = false }) {
  if (pantalla === PANTALLA.success) {
    return mostrarTransicion ? ESTADO_MASCOTA.transition : ESTADO_MASCOTA.happy;
  }
  if (pantalla === PANTALLA.customize || todoTerminado) return ESTADO_MASCOTA.calm;
  return puntosHoy > 0 ? ESTADO_MASCOTA.calm : ESTADO_MASCOTA.cold;
}

export function visualMascota(estado) {
  switch (estado) {
    case ESTADO_MASCOTA.cold:
      return { imagen: 'frio', luz: LUZ_FRIO, animacion: 'ninguna' };
    case ESTADO_MASCOTA.transition:
      return { imagenInicial: 'frio', imagen: 'calor', luzInicial: LUZ_FRIO, luz: LUZ_CALOR, animacion: 'transicion' };
    case ESTADO_MASCOTA.happy:
      return { imagen: 'calor', luz: LUZ_CALOR, animacion: 'rebote' };
    default:
      return { imagen: 'prenda', luz: LUZ_CALOR, animacion: 'ninguna' };
  }
}
