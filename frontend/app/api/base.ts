const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Resolve a relative API path against the configured base URL.
 *
 * @param path a relative API endpoint path (e.g. "/projects")
 * @returns the fully qualified API endpoint URL (e.g. "http://localhost:8080/projects")
 */
export function withBase(path: string): string {
  return new URL(path, API_BASE_URL).toString();
}
