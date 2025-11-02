declare global {
  interface Window {
    validatePassword?: (password: string) => boolean;
    validateEmail?: (email: string) => boolean;
    validateUsername?: (username: string) => boolean;
  }
}

export function validatePassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.{8,})/;
  return passwordRegex.test(password);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^\S+$/;
  return usernameRegex.test(username);
}

window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.validateUsername = validateUsername;
