let tokenActual: string | null = null;

export function setToken(token: string): void {
  tokenActual = token;
}

export function getToken(): string | null {
  return tokenActual;
}

export function limpiarToken(): void {
  tokenActual = null;
}
