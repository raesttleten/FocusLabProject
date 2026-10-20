import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider.jsx';
import { auth } from '../../services/firebase.js';
import logo from '../../assets/logo_focuslap.png';
import './Paneles.css';

function MenuCuenta() {
  const { signOut } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const correo = auth?.currentUser?.email ?? '';

  useEffect(() => {
    if (!abierto) return undefined;
    const cerrar = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && contenedor.current?.contains(event.target)) return;
      setAbierto(false);
    };
    document.addEventListener('pointerdown', cerrar);
    document.addEventListener('keydown', cerrar);
    return () => {
      document.removeEventListener('pointerdown', cerrar);
      document.removeEventListener('keydown', cerrar);
    };
  }, [abierto]);

  return (
    <div className="panel-cuenta" ref={contenedor}>
      <button
        type="button"
        className="panel-avatar"
        aria-label="Cuenta"
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((valor) => !valor)}
      >
        {correo.charAt(0).toUpperCase()}
      </button>
      {abierto && (
        <div className="panel-cuenta__menu" role="menu">
          {correo && <p className="panel-cuenta__correo">{correo}</p>}
          <button type="button" role="menuitem" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function PanelLayout({ icono, etiquetaIcono, titulo, subtitulo, acciones, children }) {
  return (
    <div className="panel">
      <nav className="panel-nav" aria-label="Menú">
        <img className="panel-nav__logo" src={logo} alt="FocusLap" width="62" height="62" />
        <span className="panel-nav__item" aria-current="page" aria-label={etiquetaIcono}>
          <img src={icono} alt="" width="24" height="24" />
        </span>
      </nav>
      <header className="panel-header">
        <div>
          <h1 className="panel-header__titulo">{titulo}</h1>
          {subtitulo && <p className="panel-header__subtitulo">{subtitulo}</p>}
        </div>
        <div className="panel-header__acciones">
          {acciones}
          <MenuCuenta />
        </div>
      </header>
      <main className="panel-contenido">{children}</main>
    </div>
  );
}
