import { ROUTES } from '../app/routes.js';

export const ROLES = {
  student: 'estudiante',
  teacher: 'docente',
  researcher: 'investigadora',
};

export function homePathFor(profile) {
  switch (profile.rol) {
    case ROLES.student:
      return profile.color ? ROUTES.studentHome : ROUTES.chooseColor;
    case ROLES.teacher:
      return ROUTES.teacherDashboard;
    case ROLES.researcher:
      return ROUTES.researcherDashboard;
    default:
      return ROUTES.login;
  }
}
