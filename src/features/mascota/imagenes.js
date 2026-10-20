import { PRENDA_POR_DEFECTO, PRENDAS } from './estado.js';

const CARPETA = '../../assets/mascota/';
const archivos = import.meta.glob('../../assets/mascota/*.png', { eager: true, import: 'default' });

export const TIPOS_IMAGEN = ['calor', 'frio', 'prenda', 'buzo'];
export const LUZ_MASCOTA = archivos[`${CARPETA}luz_mascota.png`];

export function imagenMascota(tipo, prenda) {
  const prendaValida = PRENDAS.includes(prenda) ? prenda : PRENDA_POR_DEFECTO;
  const archivo = archivos[`${CARPETA}${tipo}_${prendaValida}.png`];
  if (archivo) return archivo;
  console.warn(`Falta la imagen de la mascota ${tipo}_${prendaValida}.png`);
  return archivos[`${CARPETA}prenda_${prendaValida}.png`] ?? archivos[`${CARPETA}frio_${prendaValida}.png`] ?? null;
}
