import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from './routes.js';
import RequireRole from '../auth/RequireRole.jsx';
import { ROLES } from '../auth/roles.js';
import LoginPage from '../pages/LoginPage.jsx';
import ChooseColorPage from '../pages/ChooseColorPage.jsx';
import StudentMissionPage from '../pages/StudentMissionPage.jsx';
import GamesPage from '../pages/GamesPage.jsx';
import TeacherDashboardPage from '../pages/TeacherDashboardPage.jsx';
import ResearcherDashboardPage from '../pages/ResearcherDashboardPage.jsx';

function only(role, element) {
  return <RequireRole role={role}>{element}</RequireRole>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.chooseColor} element={only(ROLES.student, <ChooseColorPage />)} />
      <Route path={ROUTES.studentMission} element={only(ROLES.student, <StudentMissionPage />)} />
      <Route path={ROUTES.games} element={only(ROLES.student, <GamesPage />)} />
      <Route path={ROUTES.teacherDashboard} element={only(ROLES.teacher, <TeacherDashboardPage />)} />
      <Route
        path={ROUTES.researcherDashboard}
        element={only(ROLES.researcher, <ResearcherDashboardPage />)}
      />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  );
}
