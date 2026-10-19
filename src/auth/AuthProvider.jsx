import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase.js';
import { useTheme } from '../theme/ThemeProvider.jsx';
import { themeFromColor } from '../theme/themes.js';
import { isStudentEmail } from './credentials.js';
import { ROLES } from './roles.js';

const AuthContext = createContext(null);

async function loadProfile(user) {
  const userSnap = await getDoc(doc(db, 'usuarios', user.uid));
  if (userSnap.exists()) return { uid: user.uid, ...userSnap.data() };

  if (user.email && !isStudentEmail(user.email)) {
    const allowSnap = await getDoc(doc(db, 'investigadoras_autorizadas', user.email.toLowerCase()));
    if (allowSnap.exists() && allowSnap.data().activa === true) {
      return { uid: user.uid, rol: ROLES.researcher, correo: user.email };
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const { setTheme } = useTheme();
  const [state, setState] = useState({
    status: auth ? 'loading' : 'signedOut',
    profile: null,
    profileError: false,
  });

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState((current) => ({ ...current, status: 'signedOut', profile: null }));
        return;
      }
      setState({ status: 'loading', profile: null, profileError: false });
      let profile = null;
      try {
        profile = await loadProfile(user);
      } catch {
        profile = null;
      }
      if (profile) {
        setState({ status: 'ready', profile, profileError: false });
      } else {
        setState({ status: 'signedOut', profile: null, profileError: true });
        await firebaseSignOut(auth);
      }
    });
  }, []);

  useEffect(() => {
    const theme = themeFromColor(state.profile?.color);
    if (theme) setTheme(theme);
  }, [state.profile?.color, setTheme]);

  const uid = state.profile?.uid;

  const updateProfile = useCallback(
    (changes) => {
      let previous = null;
      setState((current) => {
        previous = Object.fromEntries(Object.keys(changes).map((key) => [key, current.profile?.[key]]));
        return { ...current, profile: { ...current.profile, ...changes } };
      });
      updateDoc(doc(db, 'usuarios', uid), changes).catch((error) => {
        console.error('No se pudo guardar el perfil', error);
        setState((current) => ({ ...current, profile: { ...current.profile, ...previous } }));
      });
    },
    [uid],
  );

  const saveColor = useCallback((color) => updateProfile({ color }), [updateProfile]);

  const antesDeSalir = useRef(new Set());

  const alCerrarSesion = useCallback((accion) => {
    antesDeSalir.current.add(accion);
    return () => antesDeSalir.current.delete(accion);
  }, []);

  const signOut = useCallback(() => {
    antesDeSalir.current.forEach((accion) => accion());
    return firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ ...state, updateProfile, saveColor, signOut, alCerrarSesion }),
    [state, updateProfile, saveColor, signOut, alCerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
