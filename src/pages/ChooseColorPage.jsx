import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/routes.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import logo from '../assets/logo_focuslap.png';
import CheckIcon from '../components/CheckIcon.jsx';
import { colorFromTheme, DEFAULT_THEME, themeFromColor, THEMES } from '../theme/themes.js';
import './ChooseColorPage.css';

function ThemePreview() {
  return (
    <span className="color-option__preview" aria-hidden="true">
      <span className="color-option__menu" />
      <span className="color-option__active" />
      <span className="color-option__mini-card">
        <span className="color-option__grid" />
        <span className="color-option__button" />
      </span>
      <span className="color-option__mini-card color-option__mini-card--second" />
    </span>
  );
}

export default function ChooseColorPage() {
  const { profile, saveColor } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(themeFromColor(profile?.color) ?? DEFAULT_THEME);

  function handleSubmit(event) {
    event.preventDefault();
    saveColor(colorFromTheme(selected));
    navigate(ROUTES.studentHome, { replace: true });
  }

  return (
    <main className="choose-color">
      <form className="choose-color__card" onSubmit={handleSubmit}>
        <img className="choose-color__logo" src={logo} alt="" width="68" height="68" />
        <h1 id="choose-color-title" className="choose-color__title">
          Elige el color de tu espacio
        </h1>
        <p className="choose-color__subtitle">Puedes cambiarlo cuando quieras desde Ajustes.</p>

        <fieldset className="choose-color__options" aria-labelledby="choose-color-title">
          {THEMES.map(({ id, label }) => (
            <label key={id} className="color-option" data-theme={id}>
              <input
                className="color-option__input"
                type="radio"
                name="color"
                value={id}
                checked={selected === id}
                onChange={() => setSelected(id)}
              />
              <span className="color-option__card">
                <ThemePreview />
                <span className="color-option__label">{label}</span>
                {selected === id && <CheckIcon className="color-option__check" />}
              </span>
            </label>
          ))}
        </fieldset>

        <p className="choose-color__note">
          Todos los colores son suaves para que puedas concentrarte en tus lecturas.
        </p>
        <button type="submit" className="choose-color__save">
          Guardar
        </button>
      </form>
    </main>
  );
}
