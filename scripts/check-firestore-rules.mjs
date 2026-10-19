import { loadEnv } from 'vite';
import { deleteApp, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  setLogLevel,
  terminate,
  updateDoc,
  where,
} from 'firebase/firestore';

const [teacherEmail, teacherPassword, studentPassword, testCode = 'E20', otherCode = 'E01'] =
  process.argv.slice(2);
if (!teacherEmail || !teacherPassword || !studentPassword) {
  console.error('Uso: node scripts/check-firestore-rules.mjs <correo-docente> <contraseña-docente> <contraseña-estudiantes> [código-de-prueba] [otro-código]');
  process.exit(1);
}

setLogLevel('silent');

const env = loadEnv('development', process.cwd(), 'VITE_');
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const apps = [];
async function session(name, email, password) {
  const app = initializeApp(config, name);
  apps.push(app);
  const auth = getAuth(app);
  if (email) await signInWithEmailAndPassword(auth, email, password);
  return { db: getFirestore(app), auth };
}

const results = [];
async function expectResult(label, expected, action) {
  let outcome;
  try {
    await action();
    outcome = 'permitido';
  } catch (error) {
    outcome = error.code === 'permission-denied' ? 'denegado' : `error (${error.code ?? error.message})`;
  }
  const ok = outcome === expected;
  results.push(ok);
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${label} → ${outcome}${ok ? '' : ` (se esperaba ${expected})`}`);
}

const studentEmail = (code) => `${code.toLowerCase()}@focuslab.app`;

async function main() {
  const anon = await session('anon');
  const teacher = await session('teacher', teacherEmail, teacherPassword);
  const student = await session('student', studentEmail(testCode), studentPassword);
  const other = await session('other', studentEmail(otherCode), studentPassword);
  const uid = student.auth.currentUser.uid;
  const otherUid = other.auth.currentUser.uid;
  const teacherProfile = (await getDoc(doc(teacher.db, 'usuarios', teacher.auth.currentUser.uid))).data();

  console.log(`\nSin sesión`);
  await expectResult('Leer un perfil', 'denegado', () => getDoc(doc(anon.db, 'usuarios', uid)));

  console.log(`\nDocente`);
  await expectResult('Listar estudiantes de su grupo', 'permitido', async () => {
    const snap = await getDocs(query(collection(teacher.db, 'usuarios'), where('grupoId', '==', teacherProfile.grupoId), where('rol', '==', 'estudiante')));
    console.log(`      (${snap.size} estudiantes en ${teacherProfile.grupoId})`);
  });
  await expectResult(`Leer el perfil de ${testCode}`, 'permitido', () => getDoc(doc(teacher.db, 'usuarios', uid)));
  await expectResult(`Cambiar el color de ${testCode}`, 'denegado', () => updateDoc(doc(teacher.db, 'usuarios', uid), { color: 'Verde' }));
  await expectResult('Crear un perfil con rol docente', 'denegado', () => setDoc(doc(teacher.db, 'usuarios', 'prueba-docente-falso'), { rol: 'docente', codigo: 'E99', grupoId: teacherProfile.grupoId, color: null, mascota: { nombre: 'Lumi', prenda: 'lila' } }));
  await expectResult(`Escribir progreso de ${testCode}`, 'denegado', () => setDoc(doc(teacher.db, 'progreso', uid, 'respuestas', '1_c1_1'), { dia: 1, cuento: 'c1', indice: 1, completada: true }));

  console.log(`\nEstudiante ${testCode} sobre su perfil`);
  const profileRef = doc(student.db, 'usuarios', uid);
  await expectResult('Leer su perfil', 'permitido', () => getDoc(profileRef));
  await expectResult('Guardar color "Verde"', 'permitido', () => updateDoc(profileRef, { color: 'Verde' }));
  await expectResult('Volver el color a null', 'permitido', () => updateDoc(profileRef, { color: null }));
  await expectResult('Guardar color "Morado"', 'denegado', () => updateDoc(profileRef, { color: 'Morado' }));
  await expectResult('Cambiarse el rol a docente', 'denegado', () => updateDoc(profileRef, { rol: 'docente' }));
  await expectResult('Cambiarse el grupo', 'denegado', () => updateDoc(profileRef, { grupoId: 'otro' }));
  await expectResult('Guardar mascota Lumi con prenda negra', 'permitido', () => updateDoc(profileRef, { mascota: { nombre: 'Lumi', prenda: 'negro' } }));
  await expectResult('Volver la prenda a lila', 'permitido', () => updateDoc(profileRef, { mascota: { nombre: 'Lumi', prenda: 'lila' } }));
  await expectResult('Nombre de mascota de 13 letras', 'denegado', () => updateDoc(profileRef, { mascota: { nombre: 'Abcdefghijklm', prenda: 'lila' } }));
  await expectResult('Nombre de mascota vacío', 'denegado', () => updateDoc(profileRef, { mascota: { nombre: '', prenda: 'lila' } }));
  await expectResult('Prenda que no existe', 'denegado', () => updateDoc(profileRef, { mascota: { nombre: 'Lumi', prenda: 'dorado' } }));
  await expectResult('Escribirse puntosTotales', 'denegado', () => updateDoc(profileRef, { puntosTotales: 160 }));
  await expectResult(`Leer el perfil de ${otherCode}`, 'denegado', () => getDoc(doc(student.db, 'usuarios', otherUid)));

  console.log(`\nEstudiante ${testCode} sobre su progreso`);
  const respuestaRef = doc(student.db, 'progreso', uid, 'respuestas', '1_c1_0');
  const previa = await getDoc(respuestaRef);
  if (previa.exists() && previa.data().completada === true) {
    console.log('      (1_c1_0 ya estaba completada de una corrida anterior)');
  } else {
    await expectResult('Crear respuesta 1_c1_0 en curso', 'permitido', () => setDoc(respuestaRef, { dia: 1, cuento: 'c1', indice: 0, tipo: 'Tema', intentos: 1, opcionesTocadas: [{ opcion: 'b', hora: new Date() }], completada: false, mostradaEn: new Date() }));
    await expectResult('Completar respuesta 1_c1_0', 'permitido', () => setDoc(respuestaRef, { dia: 1, cuento: 'c1', indice: 0, tipo: 'Tema', intentos: 2, opcionesTocadas: [{ opcion: 'b', hora: new Date() }, { opcion: 'a', hora: new Date() }], aciertoEnIntento: 2, segundosHastaAcertar: 12, completada: true, completadaEn: new Date() }));
  }
  await expectResult('Modificar una respuesta ya completada', 'denegado', () => setDoc(respuestaRef, { dia: 1, cuento: 'c1', indice: 0, intentos: 1, completada: true }));
  await expectResult('Respuesta con campo "puntos"', 'denegado', () => setDoc(doc(student.db, 'progreso', uid, 'respuestas', '3_c2_1'), { dia: 3, cuento: 'c2', indice: 1, completada: false, puntos: 10 }));
  await expectResult('Respuesta cuyo id no coincide con sus datos', 'denegado', () => setDoc(doc(student.db, 'progreso', uid, 'respuestas', '1_c1_1'), { dia: 1, cuento: 'c1', indice: 0, completada: false }));
  await expectResult('Respuesta de un día que no existe', 'denegado', () => setDoc(doc(student.db, 'progreso', uid, 'respuestas', '4_c1_0'), { dia: 4, cuento: 'c1', indice: 0, completada: false }));
  await expectResult('Borrar una respuesta', 'denegado', () => deleteDoc(respuestaRef));
  await expectResult('Guardar el día 1', 'permitido', () => setDoc(doc(student.db, 'progreso', uid, 'dias', '1'), { estado: 'disponible', fechaInicio: new Date(), cuentos: { c1: 'pendiente', c2: 'pendiente' }, preguntaActual: null }, { merge: true }));
  await expectResult('Guardar el día 4', 'denegado', () => setDoc(doc(student.db, 'progreso', uid, 'dias', '4'), { estado: 'disponible' }));
  await expectResult('Guardar puntosHoy en el día', 'denegado', () => setDoc(doc(student.db, 'progreso', uid, 'dias', '1'), { puntosHoy: 30 }, { merge: true }));
  let lecturaId;
  await expectResult('Registrar una lectura', 'permitido', async () => {
    lecturaId = (await addDoc(collection(student.db, 'progreso', uid, 'lecturas'), { dia: 1, cuento: 'c1', segundos: 95, modo: 'primera', fecha: new Date() })).id;
  });
  await expectResult('Modificar una lectura', 'denegado', () => updateDoc(doc(student.db, 'progreso', uid, 'lecturas', lecturaId ?? 'x'), { segundos: 1 }));
  await expectResult('Registrar una partida', 'permitido', () => addDoc(collection(student.db, 'progreso', uid, 'juegos'), { juego: 'a-todo-foco', fechaInicio: new Date(), duracion: 54, metricas: { xTocadas: 5 } }));
  await expectResult('Registrar actividad', 'permitido', () => addDoc(collection(student.db, 'progreso', uid, 'actividad'), { inicio: new Date(), fin: new Date(), segundosActivos: 60, segundosInactivos: 0, salidas: 0 }));
  await expectResult(`Escribir en el progreso de ${otherCode}`, 'denegado', () => setDoc(doc(student.db, 'progreso', otherUid, 'respuestas', '1_c1_0'), { dia: 1, cuento: 'c1', indice: 0, completada: true }));

  console.log(`\nOtros`);
  await expectResult(`${otherCode} lee el progreso de ${testCode}`, 'denegado', () => getDocs(collection(other.db, 'progreso', uid, 'respuestas')));
  await expectResult(`Docente lee el progreso de ${testCode}`, 'permitido', () => getDocs(collection(teacher.db, 'progreso', uid, 'respuestas')));
  await expectResult('Leer una colección no definida', 'denegado', () => getDocs(collection(student.db, 'sesiones')));

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed} de ${results.length} comprobaciones correctas.`);
  if (passed !== results.length) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(`Error: ${error.code ?? error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    for (const app of apps) {
      await signOut(getAuth(app)).catch(() => {});
      await terminate(getFirestore(app)).catch(() => {});
      await deleteApp(app).catch(() => {});
    }
    process.exit();
  });
