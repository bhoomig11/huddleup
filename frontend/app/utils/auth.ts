import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getAuthUsername() {
  const token = getAuthToken();
  if (token === null) {
    return null;
  }

  const decoded = jwtDecode(token);
  if (decoded.sub === undefined) {
    throw new Error("Invalid JWT token");
  }

  const username = decoded.sub;
  return username;
}

function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export { getAuthToken, getAuthUsername, setAuthToken, removeAuthToken };
