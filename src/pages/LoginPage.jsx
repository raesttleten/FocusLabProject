import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { isEmailLogin, toAuthEmail } from '../auth/credentials.js';
import { homePathFor } from '../auth/roles.js';
import softShape1 from '../assets/login/soft-shape-1.svg';
import softShape2 from '../assets/login/soft-shape-2.svg';
import logoGlow from '../assets/login/logo-glow.svg';
import iconUser from '../assets/login/icon-user.svg';
import iconLock from '../assets/login/icon-lock.svg';
import iconEye from '../assets/login/icon-eye.svg';
import iconEyeOff from '../assets/login/icon-eye-off.svg';
import './LoginPage.css';

const MESSAGES = {
  invalidCredentials: 'El usuario o la contraseña no son correctos.',
  noProfile: 'Tu cuenta todavía no está lista. Pídele ayuda a tu profe.',
  tooManyAttempts: 'Hiciste muchos intentos seguidos. Espera un momento y vuelve a intentarlo.',
  network: 'No pudimos conectarnos. Revisa el internet y vuelve a intentarlo.',
  unknown: 'No pudimos iniciar sesión. Vuelve a intentarlo.',
  notConfigured: 'Falta configurar Firebase en .env.local.',
  studentReset: 'Pídele a tu profe que te ayude a cambiar tu contraseña.',
  emailReset: 'Si el correo está registrado, te enviamos un enlace para cambiar tu contraseña.',
  emptyReset:
    'Pídele a tu profe que te ayude a cambiar tu contraseña. Si eres docente, escribe tu correo en Usuario y vuelve a tocar aquí.',
};

const CREDENTIAL_ERRORS = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-email',
  'auth/missing-password',
  'auth/user-disabled',
]);

function messageForSignInError(code) {
  if (CREDENTIAL_ERRORS.has(code)) return MESSAGES.invalidCredentials;
  if (code === 'auth/too-many-requests') return MESSAGES.tooManyAttempts;
  if (code === 'auth/network-request-failed') return MESSAGES.network;
  return MESSAGES.unknown;
}

export default function LoginPage() {
  const { status, profile, profileError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  if (status === 'ready') return <Navigate to={homePathFor(profile)} replace />;

  const busy = submitting || status === 'loading';
  const visibleError = error || (profileError && !busy ? MESSAGES.noProfile : '');

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setResetMessage('');
    if (!username.trim() || !password) {
      setError(MESSAGES.invalidCredentials);
      return;
    }
    if (!isFirebaseConfigured) {
      setError(MESSAGES.notConfigured);
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, toAuthEmail(username), password);
    } catch (signInError) {
      setError(messageForSignInError(signInError.code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError('');
    const value = username.trim();
    if (!value) {
      setResetMessage(MESSAGES.emptyReset);
      return;
    }
    if (!isEmailLogin(value)) {
      setResetMessage(MESSAGES.studentReset);
      return;
    }
    if (!isFirebaseConfigured) {
      setResetMessage(MESSAGES.notConfigured);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, toAuthEmail(value));
    } catch {
    }
    setResetMessage(MESSAGES.emailReset);
  }

  return (
    <main className="login" data-theme="lila">
      <img className="login__shape login__shape--top" src={softShape1} alt="" width="520" height="520" />
      <img className="login__shape login__shape--bottom" src={softShape2} alt="" width="420" height="420" />

      <div className="login__content">
        <section className="login__card" aria-labelledby="login-title">
          <div className="login__logo">
            <img src={logoGlow} alt="" width="96" height="96" />
            <img className="login__logo-bulb" src="/logo-foco.svg" alt="" width="52" height="60" />
          </div>
          <h1 id="login-title" className="login__title">
            FocusLab
          </h1>
          <p className="login__subtitle">Ingresa con tu usuario para empezar</p>

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            <label className="login__label" htmlFor="login-username">
              Usuario
            </label>
            <div className="login__field">
              <img src={iconUser} alt="" width="20" height="20" />
              <input
                id="login-username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="E07"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                disabled={busy}
                aria-describedby={visibleError ? 'login-error' : undefined}
              />
            </div>

            <label className="login__label login__label--password" htmlFor="login-password">
              Contraseña
            </label>
            <div className="login__field">
              <img src={iconLock} alt="" width="20" height="20" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={busy}
                aria-describedby={visibleError ? 'login-error' : undefined}
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                aria-controls="login-password"
              >
                <img src={showPassword ? iconEyeOff : iconEye} alt="" width="22" height="16" />
              </button>
            </div>

            <div className="login__forgot-row">
              <button type="button" className="login__forgot" onClick={handleForgotPassword}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <p className="login__info" role="status" aria-live="polite">
              {resetMessage}
            </p>

            <button type="submit" className="login__submit" disabled={busy} aria-busy={busy}>
              {busy ? 'Ingresando…' : 'Ingresar'}
            </button>
            <p id="login-error" className="login__error" role="alert">
              {visibleError}
            </p>
          </form>

          <hr className="login__divider" />
          <p className="login__note">Estudiantes y docentes ingresan por aquí.</p>
          <p className="login__note">El sistema te lleva a tu espacio según tu rol.</p>
        </section>

        <p className="login__footer">Universidad Católica de Colombia · Semillero de psicología</p>
      </div>
    </main>
  );
}
