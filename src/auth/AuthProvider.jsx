import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase.js';
import { useTheme } from '../theme/ThemeProvider.jsx';
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
    if (state.profile?.tema) setTheme(state.profile.tema);
  }, [state.profile?.tema, setTheme]);

  const saveTheme = useCallback(
    async (tema) => {
      await updateDoc(doc(db, 'usuarios', state.profile.uid), { tema });
      setState((current) => ({ ...current, profile: { ...current.profile, tema } }));
    },
    [state.profile?.uid],
  );

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  return (
    <AuthContext.Provider value={{ ...state, saveTheme, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
