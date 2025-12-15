/**
 * Generates a mock JWT for the demo user.
 * In a real application, this would be replaced with a proper authentication client.
 * @returns A mock JWT string.
 */
export function getMockToken(): string {
  // A simple mock token format: userId.payload.signature
  return 'demo-user.mock-payload.mock-signature';
}
/**
 * Extracts the user ID from a mock JWT.
 * @param token The mock JWT string.
 * @returns The user ID.
 */
export function getUserIdFromToken(token: string | null | undefined): string {
    if (!token) return 'anon';
    return token.split('.')[0] || 'anon';
}