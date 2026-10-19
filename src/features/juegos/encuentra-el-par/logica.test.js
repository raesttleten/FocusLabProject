import { describe, expect, it } from 'vitest';
import {
  calcularMetricas,
  crearRonda,
  elegir,
  estadoInicial,
  EVENTO,
  formatearSegundos,
  sonIguales,
} from './logica.js';

const ronda = crearRonda();
const [a, b] = ronda.par;
const distinta = (i) => ronda.figuras.findIndex((f, j) => j !== i && !sonIguales(f, ronda.figuras[i]));

describe('crearRonda', () => {
  it('12 figuras con exactamente un par idéntico', () => {
    for (let n = 0; n < 50; n++) {
      const r = crearRonda();
      expect(r.figuras).toHaveLength(12);
      const claves = r.figuras.map((f) => `${f.forma}-${f.tono}`);
      expect(new Set(claves).size).toBe(11);
      expect(r.par).toHaveLength(2);
      expect(sonIguales(r.figuras[r.par[0]], r.figuras[r.par[1]])).toBe(true);
    }
  });
});

describe('elegir', () => {
  it('la primera figura queda seleccionada y tocarla otra vez la suelta', () => {
    let paso = elegir(estadoInicial(), ronda, a);
    expect(paso.evento).toBe(EVENTO.selected);
    expect(paso.estado.seleccion).toBe(a);
    paso = elegir(paso.estado, ronda, a);
    expect(paso.evento).toBe(EVENTO.unselected);
    expect(paso.estado.seleccion).toBeNull();
  });

  it('dos figuras iguales: ronda acertada', () => {
    const { estado } = elegir(estadoInicial(), ronda, a);
    const paso = elegir(estado, ronda, b);
    expect(paso.evento).toBe(EVENTO.found);
    expect(paso.estado).toMatchObject({ terminada: true, acertada: true });
  });

  it('dos figuras distintas cuentan un toque errado; al tercero la ronda se pierde', () => {
    let estado = estadoInicial();
    const otra = distinta(a);
    for (let i = 1; i <= 3; i++) {
      estado = elegir(estado, ronda, a).estado;
      const paso = elegir(estado, ronda, otra);
      estado = paso.estado;
      expect(paso.evento).toBe(i < 3 ? EVENTO.wrong : EVENTO.lost);
      expect(estado.errores).toBe(i);
    }
    expect(estado).toMatchObject({ terminada: true, acertada: false });
    expect(elegir(estado, ronda, a).evento).toBe(EVENTO.ignored);
  });
});

describe('resultados', () => {
  it('pares encontrados, toques errados y tiempo promedio de los pares encontrados', () => {
    const rondas = [
      { acertada: true, errores: 0, ms: 3000 },
      { acertada: true, errores: 2, ms: 5400 },
      { acertada: false, errores: 3, ms: 9000 },
    ];
    expect(calcularMetricas(rondas)).toEqual({
      totalRondas: 3,
      rondasAcertadas: 2,
      toquesErrados: 5,
      tiempoPromedioPorParMs: 4200,
      rondas,
    });
  });

  it('muestra el tiempo como en el Figma ("4,2 s")', () => {
    expect(formatearSegundos(4200)).toBe('4,2 s');
    expect(formatearSegundos(null)).toBe('Sin pares');
  });
});
