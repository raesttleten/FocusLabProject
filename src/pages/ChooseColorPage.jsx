import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder.jsx';
import { ROUTES } from '../app/routes.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { THEMES } from '../theme/themes.js';
import { useTheme } from '../theme/ThemeProvider.jsx';

export default function ChooseColorPage() {
  const { theme, setTheme } = useTheme();
  const { saveTheme } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await saveTheme(theme);
      navigate(ROUTES.studentMission, { replace: true });
    } catch {
      setError('No pudimos guardar tu color. Vuelve a intentarlo.');
      setSaving(false);
    }
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
      <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      <p role="alert">{error}</p>
    </PagePlaceholder>
  );
}
