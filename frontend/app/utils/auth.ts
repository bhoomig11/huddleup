import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

interface JwtPayload {
  sub?: string;
  exp?: number;
}

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) {
      return false;
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const expirationTime = decoded.exp * 1000;
    return Date.now() < expirationTime;
  } catch {
    return false;
  }
}

function getAuthUsername() {
  const token = getAuthToken();
  if (token === null || !isTokenValid(token)) {
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.sub === undefined) {
      return null;
    }

    return decoded.sub;
  } catch {
    return null;
  }
}

function isAuthenticated(): boolean {
  const token = getAuthToken();
  return isTokenValid(token);
}

function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export {
  getAuthToken,
  getAuthUsername,
  isAuthenticated,
  isTokenValid,
  setAuthToken,
  removeAuthToken,
};
