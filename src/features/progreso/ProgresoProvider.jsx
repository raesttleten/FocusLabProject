import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider.jsx';
import { resumirProgreso } from './modelo.js';
import { escucharProgreso } from './repositorio.js';
import { useAhora } from './useAhora.js';

const ProgresoContext = createContext(null);

export function ProgresoProvider({ children }) {
  const { profile } = useAuth();
  const uid = profile?.uid;
  const ahora = useAhora();
  const [dias, setDias] = useState(null);
  const [respuestas, setRespuestas] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return undefined;
    setDias(null);
    setRespuestas(null);
    return escucharProgreso(uid, { onDias: setDias, onRespuestas: setRespuestas, onError: setError });
  }, [uid]);

  const value = useMemo(() => {
    if (error) return { cargando: false, error };
    if (!dias || !respuestas) return { cargando: true };
    return { cargando: false, uid, ahora, dias, respuestas, ...resumirProgreso(dias, respuestas, ahora) };
  }, [error, dias, respuestas, uid, ahora]);

  return <ProgresoContext.Provider value={value}>{children}</ProgresoContext.Provider>;
}

export function useProgreso() {
  const context = useContext(ProgresoContext);
  if (!context) throw new Error('useProgreso must be used inside ProgresoProvider');
  return context;
}
