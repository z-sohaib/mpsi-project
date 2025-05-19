/**
 * Validates an email address
 * @param email - The email to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length > 3 && email.includes('@');
}

/**
 * Ensures a redirect URL is safe
 * @param to - The URL to redirect to
 * @param defaultRedirect - The default URL if the provided URL is not safe
 * @returns A safe URL
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = '/',
): string {
  if (!to || typeof to !== 'string') {
    return defaultRedirect;
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect;
  }

  return to;
}
