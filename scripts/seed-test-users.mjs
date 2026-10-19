import { loadEnv } from 'vite';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, terminate } from 'firebase/firestore';

const STUDENT_COUNT = 20;
const STUDENT_CODES = Array.from({ length: STUDENT_COUNT }, (_, i) => `E${String(i + 1).padStart(2, '0')}`);
const STUDENT_EMAIL_DOMAIN = 'focuslab.app';

const [teacherEmail, teacherPassword, studentPassword] = process.argv.slice(2);
if (!teacherEmail || !teacherPassword || !studentPassword) {
  console.error('Uso: node scripts/seed-test-users.mjs <correo-docente> <contraseña-docente> <contraseña-estudiantes>');
  process.exit(1);
}
if (studentPassword.length < 6) {
  console.error('La contraseña de los estudiantes debe tener al menos 6 caracteres (exigencia de Firebase).');
  process.exit(1);
}

const env = loadEnv('development', process.cwd(), 'VITE_');
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
if (!config.apiKey || !config.projectId) {
  console.error('No encontré la configuración de Firebase en .env.local.');
  process.exit(1);
}

const teacherApp = initializeApp(config, 'teacher');
const creatorApp = initializeApp(config, 'student-creator');
const teacherAuth = getAuth(teacherApp);
const creatorAuth = getAuth(creatorApp);
const db = getFirestore(teacherApp);

async function getStudentUid(email) {
  try {
    const { user } = await createUserWithEmailAndPassword(creatorAuth, email, studentPassword);
    return { uid: user.uid, created: true };
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error;
    const { user } = await signInWithEmailAndPassword(creatorAuth, email, studentPassword);
    return { uid: user.uid, created: false };
  } finally {
    await signOut(creatorAuth);
  }
}

async function main() {
  const { user: teacher } = await signInWithEmailAndPassword(teacherAuth, teacherEmail, teacherPassword);
  const teacherSnap = await getDoc(doc(db, 'usuarios', teacher.uid));
  if (!teacherSnap.exists() || teacherSnap.data().rol !== 'docente') {
    throw new Error(`Falta el documento usuarios/${teacher.uid} con rol "docente" en Firestore.`);
  }
  const { grupoId } = teacherSnap.data();
  if (!grupoId) throw new Error(`El documento usuarios/${teacher.uid} no tiene grupoId.`);
  console.log(`Docente ${teacherEmail} · grupo ${grupoId}\n`);

  for (const codigo of STUDENT_CODES) {
    const email = `${codigo.toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
    try {
      const { uid, created } = await getStudentUid(email);
      const profileRef = doc(db, 'usuarios', uid);
      const profileSnap = await getDoc(profileRef).catch(() => null);
      if (profileSnap?.exists()) {
        console.log(`${codigo}: ya existía (cuenta y perfil), no se cambió nada.`);
        continue;
      }
      await setDoc(profileRef, { rol: 'estudiante', codigo, grupoId, tema: null });
      console.log(`${codigo}: ${created ? 'cuenta creada' : 'cuenta ya existía'} y perfil creado.`);
    } catch (error) {
      console.error(`${codigo}: no se pudo crear (${error.code ?? error.message}).`);
    }
  }
  console.log(`\nLos estudiantes entran con su código (${STUDENT_CODES[0]}…${STUDENT_CODES.at(-1)}) y la contraseña "${studentPassword}".`);
}

main()
  .catch((error) => {
    console.error(`Error: ${error.code ?? error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await signOut(teacherAuth).catch(() => {});
    await terminate(db).catch(() => {});
    await Promise.all([deleteApp(teacherApp), deleteApp(creatorApp)]).catch(() => {});
    process.exit();
  });
