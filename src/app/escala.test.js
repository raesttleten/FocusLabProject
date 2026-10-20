import { describe, expect, it } from 'vitest';
import { calcularEscala, calcularEscalaPanel } from './escala.js';

describe('escala de la página', () => {
  it('en una pantalla grande se ve al tamaño del diseño', () => {
    expect(calcularEscala({ ancho: 1920, alto: 1080, punteroFino: true })).toBe(1);
  });

  it('en un portátil se achica para que quepa a lo alto', () => {
    expect(calcularEscala({ ancho: 1536, alto: 730, punteroFino: true })).toBeCloseTo(730 / 1024, 3);
    expect(calcularEscala({ ancho: 1366, alto: 657, punteroFino: true })).toBeCloseTo(657 / 1024, 3);
  });

  it('nunca baja de 0,6 para que el texto se pueda leer', () => {
    expect(calcularEscala({ ancho: 1280, alto: 500, punteroFino: true })).toBe(0.6);
  });

  it('en tabletas táctiles y pantallas angostas no cambia', () => {
    expect(calcularEscala({ ancho: 1024, alto: 700, punteroFino: false })).toBe(1);
    expect(calcularEscala({ ancho: 780, alto: 500, punteroFino: true })).toBe(1);
  });
});

describe('escala de los paneles de docente e investigadora', () => {
  it('se ajusta solo al ancho, sin importar lo bajita que sea la pantalla', () => {
    expect(calcularEscalaPanel({ ancho: 1366, punteroFino: true })).toBeCloseTo(1366 / 1536, 3);
    expect(calcularEscalaPanel({ ancho: 1920, punteroFino: true })).toBe(1);
  });

  it('nunca baja de 0,8 para que la letra se lea bien', () => {
    expect(calcularEscalaPanel({ ancho: 1024, punteroFino: true })).toBe(0.8);
  });

  it('en tabletas táctiles no cambia', () => {
    expect(calcularEscalaPanel({ ancho: 1280, punteroFino: false })).toBe(1);
  });
});
