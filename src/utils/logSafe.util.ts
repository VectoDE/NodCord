/**
 * Macht nutzerkontrollierte Werte für Logzeilen unschädlich (Log-Injection, CWE-117).
 * Entfernt Zeilenumbrüche und weitere Steuerzeichen und kürzt lange Werte,
 * damit niemand gefälschte Logzeilen einschleusen kann.
 */
export function logSafe(value: unknown, maxLength = 200): string {
  const text = typeof value === 'string' ? value : String(value ?? '');
  // eslint-disable-next-line no-control-regex
  const cleaned = text.replace(/\r|\n/g, ' ').replace(/[\u0000-\u001f\u007f-\u009f  ]/g, '');
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}…` : cleaned;
}
