import { beforeEach, describe, expect, it } from 'vitest';
import { guardarLecturaPendiente, tomarLecturasPendientes } from './pendientes.js';

const almacen = new Map();
globalThis.localStorage = {
  getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
  setItem: (k, v) => almacen.set(k, String(v)),
};

describe('lecturas pendientes al cerrar la página', () => {
  beforeEach(() => almacen.clear());

  it('se guardan en el equipo y se entregan una sola vez a su dueño, con la fecha original', () => {
    const fecha = new Date('2026-10-20T10:00:00-05:00');
    guardarLecturaPendiente('a', { dia: 1, cuento: 'c1', segundos: 90, modo: 'primera', fecha });
    guardarLecturaPendiente('b', { dia: 2, cuento: 'c2', segundos: 30, modo: 'repaso', fecha });
    expect(tomarLecturasPendientes('a')).toEqual([{ dia: 1, cuento: 'c1', segundos: 90, modo: 'primera', fecha }]);
    expect(tomarLecturasPendientes('a')).toEqual([]);
    expect(tomarLecturasPendientes('b')).toHaveLength(1);
  });

  it('si el almacenamiento no funciona, no rompe la app', () => {
    almacen.set('focuslap-lecturas-pendientes', 'no es json');
    expect(tomarLecturasPendientes('a')).toEqual([]);
  });
});
