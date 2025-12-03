import { redirect } from "react-router";

/**
 * Checks if an error is an authentication error (token expired or missing)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Authentication token is required") ||
      error.message.includes("has expired")
    );
  }
  return false;
}

/**
 * Redirects to login page with a return URL parameter
 * @param currentPath The current path to return to after login
 */
export function redirectToLogin(currentPath: string): never {
  const returnUrl = encodeURIComponent(currentPath);
  throw redirect(`/login?returnUrl=${returnUrl}`);
}

