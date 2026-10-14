import { useAuth } from '../auth/AuthProvider.jsx';

export default function PagePlaceholder({ title, description, children }) {
  const { status, signOut } = useAuth();

  return (
    <main className="page">
      <section className="card">
        <img src="/logo-foco.svg" alt="" width="52" height="60" />
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
