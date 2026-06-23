const TOKEN_KEY = "admin_token";

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function limpiarToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
