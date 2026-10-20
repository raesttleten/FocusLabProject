import { describe, expect, it } from 'vitest';
import {
  ESTADO_MASCOTA,
  estadoMascota,
  LUZ_CALOR,
  LUZ_FRIO,
  normalizarMascota,
  PANTALLA,
  validarNombreMascota,
  visualMascota,
} from './estado.js';
import { imagenMascota, LUZ_MASCOTA, TIPOS_IMAGEN } from './imagenes.js';

describe('estadoMascota', () => {
  it('en el inicio tiene frío si hoy no ha ganado puntos', () => {
    expect(estadoMascota({ pantalla: PANTALLA.home, puntosHoy: 0 })).toBe(ESTADO_MASCOTA.cold);
  });

  it('en el inicio queda tranquila después de ganar puntos hoy', () => {
    expect(estadoMascota({ pantalla: PANTALLA.home, puntosHoy: 10 })).toBe(ESTADO_MASCOTA.calm);
  });

  it('en "¡Lo lograste!" muestra la transición solo cuando corresponde', () => {
    expect(estadoMascota({ pantalla: PANTALLA.success, puntosHoy: 20, mostrarTransicion: true })).toBe(
      ESTADO_MASCOTA.transition,
    );
    expect(estadoMascota({ pantalla: PANTALLA.success, puntosHoy: 40 })).toBe(ESTADO_MASCOTA.happy);
  });

  it('después del día 3 queda tranquila aunque hoy no haya puntos', () => {
    expect(estadoMascota({ pantalla: PANTALLA.home, puntosHoy: 0, todoTerminado: true })).toBe(
      ESTADO_MASCOTA.calm,
    );
  });

  it('en Personalizar se ve de pie con su prenda', () => {
    expect(estadoMascota({ pantalla: PANTALLA.customize, puntosHoy: 0 })).toBe(ESTADO_MASCOTA.calm);
  });
});

describe('visualMascota', () => {
  it('con frío: imagen frio, luz al 30 % y sin animación', () => {
    expect(visualMascota(ESTADO_MASCOTA.cold)).toEqual({ imagen: 'frio', luz: LUZ_FRIO, animacion: 'temblor' });
  });

  it('tranquila: imagen prenda, sin animación', () => {
    expect(visualMascota(ESTADO_MASCOTA.calm)).toEqual({ imagen: 'prenda', luz: LUZ_CALOR, animacion: 'ninguna' });
  });

  it('transición: de frio a calor y la luz sube al 100 %', () => {
    expect(visualMascota(ESTADO_MASCOTA.transition)).toEqual({
      imagenInicial: 'frio',
      imagen: 'calor',
      luzInicial: LUZ_FRIO,
      luz: LUZ_CALOR,
      animacion: 'transicion',
    });
  });

  it('feliz: imagen calor rebotando', () => {
    expect(visualMascota(ESTADO_MASCOTA.happy).animacion).toBe('rebote');
  });
});

describe('nombre y prenda', () => {
  it('por defecto se llama Lumi y lleva la prenda lila', () => {
    expect(normalizarMascota(undefined)).toEqual({ nombre: 'Lumi', prenda: 'lila' });
    expect(normalizarMascota({ nombre: '   ', prenda: 'dorado' })).toEqual({ nombre: 'Lumi', prenda: 'lila' });
  });

  it('conserva el nombre y la prenda guardados', () => {
    expect(normalizarMascota({ nombre: 'Chispa', prenda: 'negro' })).toEqual({ nombre: 'Chispa', prenda: 'negro' });
  });

  it('acepta nombres de 1 a 12 letras y no vacíos', () => {
    expect(validarNombreMascota('Abcdefghijkl').valido).toBe(true);
    expect(validarNombreMascota('Abcdefghijklm').valido).toBe(false);
    expect(validarNombreMascota('').valido).toBe(false);
    expect(validarNombreMascota('  Ñoño  ')).toEqual({ nombre: 'Ñoño', valido: true });
  });
});

describe('imagenMascota', () => {
  it('existen las 16 imágenes estado_prenda y la luz', () => {
    for (const tipo of TIPOS_IMAGEN) {
      for (const prenda of ['lila', 'rosa', 'negro', 'verde']) {
        expect(imagenMascota(tipo, prenda)).toContain(`${tipo}_${prenda}.png`);
      }
    }
    expect(LUZ_MASCOTA).toContain('luz_mascota.png');
  });

  it('usa la prenda lila si la prenda no existe', () => {
    expect(imagenMascota('frio', 'dorado')).toContain('frio_lila.png');
  });
});
