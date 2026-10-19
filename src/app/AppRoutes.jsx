import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ROUTES } from './routes.js';
import RequireRole from '../auth/RequireRole.jsx';
import { ROLES } from '../auth/roles.js';
import { ProgresoProvider } from '../features/progreso/ProgresoProvider.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ChooseColorPage from '../pages/ChooseColorPage.jsx';
import StudentHomePage from '../pages/StudentHomePage.jsx';
import GamesPage from '../pages/GamesPage.jsx';
import TeacherDashboardPage from '../pages/TeacherDashboardPage.jsx';
import ResearcherDashboardPage from '../pages/ResearcherDashboardPage.jsx';

function only(role, element) {
  return <RequireRole role={role}>{element}</RequireRole>;
}

function StudentArea() {
  return only(
    ROLES.student,
    <ProgresoProvider>
      <Outlet />
    </ProgresoProvider>,
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route element={<StudentArea />}>
        <Route path={ROUTES.chooseColor} element={<ChooseColorPage />} />
        <Route path={ROUTES.studentHome} element={<StudentHomePage />} />
        <Route path={ROUTES.games} element={<GamesPage />} />
      </Route>
      <Route path={ROUTES.teacherDashboard} element={only(ROLES.teacher, <TeacherDashboardPage />)} />
      <Route
        path={ROUTES.researcherDashboard}
        element={only(ROLES.researcher, <ResearcherDashboardPage />)}
      />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  );
}
