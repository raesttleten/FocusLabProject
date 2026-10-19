import { describe, expect, it } from 'vitest';
import { ESTADO_DIA } from '../progreso/diaActual.js';
import { ESTADO_MASCOTA, MENSAJE_FRIO } from '../mascota/estado.js';
import { ESTADO_INICIO, mensajeMascota, minutosDeLectura, vistaInicio } from './vistaInicio.js';

const registro = (c1, c2) => ({ cuentos: { c1, c2 } });
const enCurso = (dia) => ({ dia, estado: ESTADO_DIA.inProgress });

describe('vistaInicio', () => {
  it('estado A: ningún cuento hecho, "Lee y responde" y juegos con candado', () => {
    const vista = vistaInicio({ diaActual: enCurso(1), registroDia: null, puntosTotales: 0 });
    expect(vista.estado).toBe(ESTADO_INICIO.noneDone);
    expect(vista.titulo).toBe('Lee y responde');
    expect(vista.cuentos.map((c) => c.terminado)).toEqual([false, false]);
    expect(vista.cuentos[0]).toMatchObject({ numero: 1, titulo: 'El último penalti', minutos: 2, preguntas: 2, puntos: 20 });
    expect(vista.juegosHoy.map((j) => [j.nombre, j.abierto])).toEqual([
      ['A Todo Foco', false],
      ['Repite el Patrón', false],
    ]);
  });

  it('estado B: un cuento hecho (en cualquier orden) y su juego abierto', () => {
    const vista = vistaInicio({ diaActual: enCurso(1), registroDia: registro('pendiente', 'terminado'), puntosTotales: 20 });
    expect(vista.estado).toBe(ESTADO_INICIO.oneDone);
    expect(vista.cuentos.map((c) => c.terminado)).toEqual([false, true]);
    expect(vista.juegosHoy.map((j) => j.abierto)).toEqual([true, false]);
  });

  it('estado C: "¡Terminaste por hoy!" con los dos juegos del día', () => {
    const vista = vistaInicio({
      diaActual: { dia: 1, estado: ESTADO_DIA.finishedToday },
      registroDia: registro('terminado', 'terminado'),
      puntosTotales: 40,
    });
    expect(vista.estado).toBe(ESTADO_INICIO.dayDone);
    expect(vista.titulo).toBe('¡Terminaste por hoy!');
    expect(vista.descripcion).toMatch(/^Vuelve mañana/);
    expect(vista.juegosHoy.every((j) => j.abierto)).toBe(true);
  });

  it('el día 2 muestra 3 preguntas y 30 puntos por cuento', () => {
    const vista = vistaInicio({ diaActual: enCurso(2), registroDia: null, puntosTotales: 40 });
    expect(vista.cuentos[1]).toMatchObject({ preguntas: 3, puntos: 30 });
    expect(vista.nombreDia).toBe('Pistas del autor');
  });

  it('tu semana de lectura: hecho, hoy y días futuros con candado', () => {
    const vista = vistaInicio({ diaActual: enCurso(1), registroDia: null, puntosTotales: 0 });
    expect(vista.semana.map((s) => s.texto)).toEqual(['Hoy', 'Se abre mañana', 'Se abre en 2 días']);
    const dia2 = vistaInicio({ diaActual: enCurso(2), registroDia: null, puntosTotales: 40 });
    expect(dia2.semana.map((s) => s.texto)).toEqual(['Hecho ✓', 'Hoy', 'Se abre mañana']);
    const terminado = vistaInicio({ diaActual: { dia: 2, estado: ESTADO_DIA.finishedToday }, registroDia: registro('terminado', 'terminado'), puntosTotales: 100 });
    expect(terminado.semana.map((s) => s.texto)).toEqual(['Hecho ✓', 'Terminado ✓', 'Se abre mañana']);
  });

  it('otros días: los pasados "Ya puedes jugarlos" y los futuros "Vuelve mañana"', () => {
    const vista = vistaInicio({ diaActual: enCurso(2), registroDia: null, puntosTotales: 40 });
    expect(vista.otrosDias.map((o) => [o.dia, o.texto])).toEqual([
      [1, 'Ya puedes jugarlos'],
      [3, 'Vuelve mañana'],
    ]);
    expect(vista.otrosDias[0].juegos.every((j) => j.abierto)).toBe(true);
    expect(vista.otrosDias[1].juegos.some((j) => j.abierto)).toBe(false);
  });

  it('después del día 3: todo hecho, todos los juegos abiertos y cuentos en repaso', () => {
    const vista = vistaInicio({ diaActual: { dia: 3, estado: ESTADO_DIA.allDone }, registroDia: registro('terminado', 'terminado'), puntosTotales: 160 });
    expect(vista.estado).toBe(ESTADO_INICIO.allDone);
    expect(vista.titulo).toBe('¡Terminaste las 3 lecturas!');
    expect(vista.cuentos.every((c) => c.terminado)).toBe(true);
    expect([...vista.juegosHoy, ...vista.otrosDias.flatMap((o) => o.juegos)].every((j) => j.abierto)).toBe(true);
    expect(vista.semana.every((s) => s.texto === 'Hecho ✓')).toBe(true);
  });
});

describe('mensajeMascota', () => {
  it('con frío pide leer, sin importar el estado del día', () => {
    expect(mensajeMascota(ESTADO_MASCOTA.cold, ESTADO_INICIO.oneDone, 1)).toBe(MENSAJE_FRIO);
  });

  it('usa los textos del Figma para los estados B y C', () => {
    expect(mensajeMascota(ESTADO_MASCOTA.calm, ESTADO_INICIO.oneDone, 1)).toBe('¡Gracias! Ya me siento mejor.');
    expect(mensajeMascota(ESTADO_MASCOTA.calm, ESTADO_INICIO.dayDone, 1)).toBe('¡Gracias por leer! Mañana vuelvo a tener frío… ¡te espero!');
  });

  it('no promete un mañana después del día 3', () => {
    expect(mensajeMascota(ESTADO_MASCOTA.calm, ESTADO_INICIO.dayDone, 3)).not.toMatch(/Mañana/);
  });
});

describe('minutosDeLectura', () => {
  it('redondea a minutos, mínimo 1', () => {
    expect(minutosDeLectura(319)).toBe(2);
    expect(minutosDeLectura(40)).toBe(1);
  });
});
