export const STUDENT_EMAIL_DOMAIN = 'focuslab.app';

export function isEmailLogin(username) {
  return username.includes('@');
}

export function toAuthEmail(username) {
  const value = username.trim().toLowerCase();
  return isEmailLogin(value) ? value : `${value}@${STUDENT_EMAIL_DOMAIN}`;
}

export function isStudentEmail(email) {
  return Boolean(email) && email.toLowerCase().endsWith(`@${STUDENT_EMAIL_DOMAIN}`);
}
