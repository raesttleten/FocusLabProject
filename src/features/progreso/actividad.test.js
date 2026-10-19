import { describe, expect, it } from 'vitest';
import { avanzar, crearContador, interactuar, mostrar, ocultar, resumenActividad } from './actividad.js';

const s = (segundos) => segundos * 1000;

describe('tiempo activo e inactivo', () => {
  it('con interacción frecuente todo el tiempo es activo', () => {
    let c = crearContador(0);
    for (let t = 10; t <= 120; t += 10) c = interactuar(c, s(t));
    expect(resumenActividad(c)).toEqual({ segundosActivos: 120, segundosInactivos: 0, salidas: 0 });
  });

  it('después de 60 s sin toques, teclas ni scroll el tiempo pasa a inactivo', () => {
    let c = crearContador(0);
    c = avanzar(c, s(100));
    expect(resumenActividad(c)).toEqual({ segundosActivos: 60, segundosInactivos: 40, salidas: 0 });
    c = interactuar(c, s(110));
    c = avanzar(c, s(130));
    expect(resumenActividad(c)).toEqual({ segundosActivos: 80, segundosInactivos: 50, salidas: 0 });
  });

  it('con la pestaña oculta todo cuenta como inactivo', () => {
    let c = crearContador(0);
    c = ocultar(c, s(20));
    c = mostrar(c, s(80));
    c = avanzar(c, s(90));
    expect(resumenActividad(c)).toEqual({ segundosActivos: 30, segundosInactivos: 60, salidas: 0 });
  });

  it('ocultar la pestaña más de 5 minutos cuenta como una salida de la app', () => {
    let c = crearContador(0);
    c = ocultar(c, s(10));
    c = mostrar(c, s(10 + 5 * 60 + 1));
    expect(c.salidas).toBe(1);
    c = ocultar(c, s(400));
    c = mostrar(c, s(400 + 5 * 60));
    expect(c.salidas).toBe(1);
  });

  it('si la app abre con la pestaña oculta, empieza contando inactivo', () => {
    let c = crearContador(0, false);
    c = mostrar(c, s(30));
    expect(resumenActividad(c)).toEqual({ segundosActivos: 0, segundosInactivos: 30, salidas: 0 });
  });

  it('el reloj que va hacia atrás no resta tiempo', () => {
    const c = avanzar(crearContador(s(50)), s(40));
    expect(resumenActividad(c)).toEqual({ segundosActivos: 0, segundosInactivos: 0, salidas: 0 });
  });
});
