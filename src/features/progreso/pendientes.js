const CLAVE = 'focuslap-lecturas-pendientes';

function leerLista() {
  const lista = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
  return Array.isArray(lista) ? lista : [];
}

export function guardarLecturaPendiente(uid, lectura) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...leerLista(), { uid, ...lectura, fecha: lectura.fecha.toISOString() }]));
    return true;
  } catch {
    return false;
  }
}

export function tomarLecturasPendientes(uid) {
  try {
    const lista = leerLista();
    const propias = lista.filter((l) => l.uid === uid);
    if (!propias.length) return [];
    localStorage.setItem(CLAVE, JSON.stringify(lista.filter((l) => l.uid !== uid)));
    return propias.map(({ uid: _dueno, ...lectura }) => ({ ...lectura, fecha: new Date(lectura.fecha) }));
  } catch {
    return [];
  }
}
