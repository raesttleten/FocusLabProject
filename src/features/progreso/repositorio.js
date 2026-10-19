import { addDoc, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { respuestaId } from '../contenido/cuentos.js';
import { nuevoRegistroDia, registroTrasTerminarCuento } from './modelo.js';

const diasRef = (uid) => collection(db, 'progreso', uid, 'dias');
const diaRef = (uid, dia) => doc(db, 'progreso', uid, 'dias', String(dia));
const respuestasRef = (uid) => collection(db, 'progreso', uid, 'respuestas');

function enSegundoPlano(escritura, descripcion) {
  escritura.catch((error) => console.error(`No se pudo guardar ${descripcion}`, error));
}

export function escucharProgreso(uid, { onDias, onRespuestas, onError }) {
  const dejarDias = onSnapshot(
    diasRef(uid),
    (snap) => onDias(Object.fromEntries(snap.docs.map((d) => [Number(d.id), d.data()]))),
    onError,
  );
  const dejarRespuestas = onSnapshot(
    respuestasRef(uid),
    (snap) => onRespuestas(snap.docs.map((d) => d.data())),
    onError,
  );
  return () => {
    dejarDias();
    dejarRespuestas();
  };
}

export function asegurarDia(uid, dia, registroActual, fecha) {
  if (registroActual) return;
  enSegundoPlano(setDoc(diaRef(uid, dia), nuevoRegistroDia(fecha)), `el inicio del día ${dia}`);
}

export function guardarPreguntaActual(uid, dia, preguntaActual) {
  enSegundoPlano(setDoc(diaRef(uid, dia), { preguntaActual }, { merge: true }), 'la pregunta actual');
}

export function guardarRespuesta(uid, respuesta) {
  const id = respuestaId(respuesta.dia, respuesta.cuento, respuesta.indice);
  enSegundoPlano(setDoc(doc(respuestasRef(uid), id), respuesta), `la respuesta ${id}`);
}

export function terminarCuento(uid, dia, registroActual, cuentoId, fecha) {
  const registro = registroTrasTerminarCuento(registroActual, cuentoId, fecha);
  enSegundoPlano(setDoc(diaRef(uid, dia), registro), `el fin del cuento ${cuentoId}`);
  return registro;
}

export function marcarTransicion(uid, dia, fechaColombia) {
  enSegundoPlano(
    setDoc(diaRef(uid, dia), { transicionMostrada: fechaColombia }, { merge: true }),
    'la transición de la mascota',
  );
}

export function registrarLectura(uid, lectura) {
  enSegundoPlano(addDoc(collection(db, 'progreso', uid, 'lecturas'), lectura), 'la lectura');
}

export function registrarPartida(uid, partida) {
  enSegundoPlano(addDoc(collection(db, 'progreso', uid, 'juegos'), partida), 'la partida');
}
