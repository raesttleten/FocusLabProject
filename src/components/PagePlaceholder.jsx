import { useAuth } from '../auth/AuthProvider.jsx';
import logo from '../assets/logo_focuslap.png';

export default function PagePlaceholder({ title, description, children }) {
  const { status, signOut } = useAuth();

  return (
    <main className="page">
      <section className="card">
        <img src={logo} alt="" width="68" height="68" />
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        {status === 'ready' && (
          <button type="button" className="sign-out" onClick={signOut}>
            Cerrar sesión
          </button>
        )}
      </section>
    </main>
  );
}
