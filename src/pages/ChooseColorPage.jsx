import { useNavigate } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder.jsx';
import { ROUTES } from '../app/routes.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { colorFromTheme, THEMES } from '../theme/themes.js';
import { useTheme } from '../theme/ThemeProvider.jsx';

export default function ChooseColorPage() {
  const { theme, setTheme } = useTheme();
  const { saveColor } = useAuth();
  const navigate = useNavigate();

  function handleSave() {
    saveColor(colorFromTheme(theme));
    navigate(ROUTES.studentHome, { replace: true });
  }

  return (
    <PagePlaceholder
      title="Elige el color de tu espacio"
      description="Puedes cambiarlo cuando quieras desde Ajustes."
    >
      <div className="theme-options">
        {THEMES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="theme-option"
            data-theme={id}
            aria-pressed={theme === id}
            onClick={() => setTheme(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <button type="button" className="primary-button" onClick={handleSave}>
        Guardar
      </button>
    </PagePlaceholder>
  );
}
