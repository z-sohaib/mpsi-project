/**
 * Helper function for formatting dates consistently
 * Safe to use on both client and server
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR');
}
