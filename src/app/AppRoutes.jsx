import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from './routes.js';
import RequireRole from '../auth/RequireRole.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { ROLES } from '../auth/roles.js';
import { ProgresoProvider } from '../features/progreso/ProgresoProvider.jsx';
import { useRegistroActividad } from '../features/progreso/useRegistroActividad.js';
import InicioPage from '../features/estudiante/InicioPage.jsx';
import LecturaPage from '../features/lectura/LecturaPage.jsx';
import PreguntasPage from '../features/preguntas/PreguntasPage.jsx';
import LogradoPage from '../features/preguntas/LogradoPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ChooseColorPage from '../pages/ChooseColorPage.jsx';
import JuegosPage from '../features/juegos/JuegosPage.jsx';
import JuegoPage from '../features/juegos/JuegoPage.jsx';
import PanelDocente from '../features/paneles/docente/PanelDocente.jsx';
import PanelInvestigadora from '../features/paneles/investigadora/PanelInvestigadora.jsx';

function only(role, element) {
  return <RequireRole role={role}>{element}</RequireRole>;
}

function StudentOutlet() {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  useRegistroActividad();
  if (!profile.color && pathname !== ROUTES.chooseColor) return <Navigate to={ROUTES.chooseColor} replace />;
  return (
    <ProgresoProvider>
      <Outlet />
    </ProgresoProvider>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route element={only(ROLES.student, <StudentOutlet />)}>
        <Route path={ROUTES.chooseColor} element={<ChooseColorPage />} />
        <Route path={ROUTES.studentHome} element={<InicioPage />} />
        <Route path={ROUTES.reading} element={<LecturaPage />} />
        <Route path={ROUTES.questions} element={<PreguntasPage />} />
        <Route path={ROUTES.storyDone} element={<LogradoPage />} />
        <Route path={ROUTES.games} element={<JuegosPage />} />
        <Route path={ROUTES.game} element={<JuegoPage />} />
      </Route>
      <Route path={ROUTES.teacherDashboard} element={only(ROLES.teacher, <PanelDocente />)} />
      <Route
        path={ROUTES.researcherDashboard}
        element={only(ROLES.researcher, <PanelInvestigadora />)}
      />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  );
}
