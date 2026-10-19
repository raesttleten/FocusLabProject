export const ROUTES = {
  login: '/login',
  chooseColor: '/elegir-color',
  studentHome: '/estudiante',
  reading: '/estudiante/cuento/:cuentoId/lectura',
  questions: '/estudiante/cuento/:cuentoId/preguntas',
  storyDone: '/estudiante/cuento/:cuentoId/logrado',
  games: '/estudiante/juegos',
  game: '/estudiante/juegos/:juegoId',
  teacherDashboard: '/docente',
  researcherDashboard: '/investigadora',
};

export function routeTo(route, params = {}) {
  return route.replace(/:(\w+)/g, (_, key) => encodeURIComponent(params[key]));
}
