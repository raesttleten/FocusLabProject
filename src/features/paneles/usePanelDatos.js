import { useCallback, useEffect, useState } from 'react';
import { cargarEstudiantes } from './repositorio.js';

export function usePanelDatos(opciones) {
  const grupoId = opciones?.grupoId;
  const [estado, setEstado] = useState({ cargando: true, error: null, estudiantes: [] });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado((actual) => ({ ...actual, cargando: true, error: null }));
    cargarEstudiantes({ grupoId })
      .then((estudiantes) => vigente && setEstado({ cargando: false, error: null, estudiantes }))
      .catch((error) => {
        console.error('No se pudieron cargar los datos del panel', error);
        if (vigente) setEstado((actual) => ({ ...actual, cargando: false, error }));
      });
    return () => {
      vigente = false;
    };
  }, [grupoId, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}
