import { useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/AuthProvider.jsx';
import { normalizarMascota, validarNombreMascota } from './estado.js';
import { imagenMascota } from './imagenes.js';

export function useMascota() {
  const { profile, updateProfile } = useAuth();
  const { nombre, prenda } = normalizarMascota(profile?.mascota);

  const imagen = useCallback((tipo, otraPrenda) => imagenMascota(tipo, otraPrenda ?? prenda), [prenda]);

  const guardar = useCallback(
    (cambios) => {
      if (cambios.nombre !== undefined && !validarNombreMascota(cambios.nombre).valido) return false;
      updateProfile({ mascota: normalizarMascota({ nombre, prenda, ...cambios }) });
      return true;
    },
    [nombre, prenda, updateProfile],
  );

  return useMemo(() => ({ nombre, prenda, imagen, guardar }), [nombre, prenda, imagen, guardar]);
}
