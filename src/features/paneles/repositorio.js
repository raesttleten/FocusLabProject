import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase.js';

const SUBCOLECCIONES = ['respuestas', 'lecturas', 'juegos', 'actividad'];

async function leerSubcoleccion(uid, nombre) {
  const snap = await getDocs(collection(db, 'progreso', uid, nombre));
  return snap.docs.map((d) => d.data());
}

async function leerProgreso(uid) {
  const [diasSnap, ...listas] = await Promise.all([
    getDocs(collection(db, 'progreso', uid, 'dias')),
    ...SUBCOLECCIONES.map((nombre) => leerSubcoleccion(uid, nombre)),
  ]);
  return {
    dias: Object.fromEntries(diasSnap.docs.map((d) => [Number(d.id), d.data()])),
    ...Object.fromEntries(SUBCOLECCIONES.map((nombre, i) => [nombre, listas[i]])),
  };
}

export async function cargarEstudiantes({ grupoId } = {}) {
  const filtros = [where('rol', '==', 'estudiante')];
  if (grupoId) filtros.push(where('grupoId', '==', grupoId));
  const snap = await getDocs(query(collection(db, 'usuarios'), ...filtros));
  const estudiantes = await Promise.all(
    snap.docs.map(async (d) => ({ uid: d.id, codigo: d.data().codigo, ...(await leerProgreso(d.id)) })),
  );
  return estudiantes.sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true }));
}
