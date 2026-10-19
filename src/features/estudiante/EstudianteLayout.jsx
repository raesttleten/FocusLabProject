import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes.js';
import { useAuth } from '../../auth/AuthProvider.jsx';
import logo from '../../assets/logo_focuslap.png';
import iconoInicio from '../../assets/estudiante/icono-inicio.svg';
import iconoJuegos from '../../assets/estudiante/icono-juegos.svg';
import iconoAjustes from '../../assets/estudiante/icono-ajustes.svg';
import estrella from '../../assets/estudiante/estrella.svg';
import { useProgreso } from '../progreso/ProgresoProvider.jsx';
import './EstudianteLayout.css';

function MenuIcon({ src }) {
  return <span className="student-nav__icon" style={{ '--icono': `url("${src}")` }} aria-hidden="true" />;
}

function Ajustes() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);

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
    <div className="student-settings" ref={contenedor}>
      <button
        type="button"
        className="student-nav__item"
        aria-label="Ajustes"
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((valor) => !valor)}
      >
        <MenuIcon src={iconoAjustes} />
      </button>
      {abierto && (
        <div className="student-settings__menu" role="menu">
          <button type="button" role="menuitem" onClick={() => navigate(ROUTES.chooseColor)}>
            Cambiar color
          </button>
          <button type="button" role="menuitem" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function EstudianteLayout({ titulo, subtitulo, etiqueta, acciones, sinAvatar = false, children }) {
  const { profile } = useAuth();
  const progreso = useProgreso();
  const { pathname } = useLocation();
  const inicial = (profile?.codigo ?? '').charAt(0).toLowerCase();
  const enJuegos = pathname.startsWith(ROUTES.games);
  const claseItem = (activo) => `student-nav__item${activo ? ' active' : ''}`;

  return (
    <div className="student">
      <nav className="student-nav" aria-label="Menú">
        <img className="student-nav__logo" src={logo} alt="FocusLap" width="62" height="62" />
        <div className="student-nav__main">
          <Link to={ROUTES.studentHome} className={claseItem(!enJuegos)} aria-label="Inicio" aria-current={enJuegos ? undefined : 'page'}>
            <MenuIcon src={iconoInicio} />
          </Link>
          <Link to={ROUTES.games} className={claseItem(enJuegos)} aria-label="Juegos" aria-current={enJuegos ? 'page' : undefined}>
            <MenuIcon src={iconoJuegos} />
          </Link>
        </div>
        <Ajustes />
      </nav>

      <header className="student-header">
        <div>
          <h1 className="student-header__title">{titulo}</h1>
          {subtitulo && <p className="student-header__subtitle">{subtitulo}</p>}
          {etiqueta && <span className="student-header__tag">{etiqueta}</span>}
        </div>
        <div className="student-header__aside">
          {acciones}
          <div className="student-points" aria-label={`${progreso.puntosTotales ?? 0} puntos`}>
            <img src={estrella} alt="" width="22" height="22" />
            <span>{progreso.puntosTotales ?? 0}</span>
          </div>
          {!sinAvatar && (
            <div className="student-avatar" aria-hidden="true">
              {inicial}
            </div>
          )}
        </div>
      </header>

      <main className="student-content">{children}</main>
    </div>
  );
}
