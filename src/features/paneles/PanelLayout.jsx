import { useAuth } from '../../auth/AuthProvider.jsx';
import { auth } from '../../services/firebase.js';
import logo from '../../assets/logo_focuslap.png';
import './Paneles.css';

function Cuenta() {
  const { signOut } = useAuth();
  const correo = auth?.currentUser?.email ?? '';

  return (
    <div className="panel-cuenta">
      <span className="panel-avatar" title={correo} aria-hidden="true">
        {correo.charAt(0).toUpperCase()}
      </span>
      <button type="button" className="panel-boton panel-boton--secundario panel-salir" onClick={signOut}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Cerrar sesión
      </button>
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
          <Cuenta />
        </div>
      </header>
      <main className="panel-contenido">{children}</main>
    </div>
  );
}
