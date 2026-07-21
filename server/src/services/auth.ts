import { createHash, createHmac, timingSafeEqual } from "crypto";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
const SESSION_DURATION_SECONDS: number = 600;

// Único admin del sistema: credenciales por entorno (en desarrollo aplican
// los mismos valores por defecto que usaba el seed).
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL ?? "admin@torneo.com";
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD ?? "admin123";

/** Identificador fijo que viaja en el token (ya no hay tabla de admins). */
export const ADMIN_ID: string = "admin";

export interface TokenPayload {
  adminId: string;
  iat: number;
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function firmar(headerAndPayload: string): string {
  return base64url(createHmac("sha256", JWT_SECRET).update(headerAndPayload).digest());
}

export function generarToken(adminId: string): { token: string; expiresInSeconds: number } {
  const iat: number = Math.floor(Date.now() / 1000);
  const exp: number = iat + SESSION_DURATION_SECONDS;
  const header: string = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: string = base64url(JSON.stringify({ adminId, iat, exp }));
  const headerAndPayload: string = `${header}.${payload}`;
  const firma: string = firmar(headerAndPayload);
  return { token: `${headerAndPayload}.${firma}`, expiresInSeconds: SESSION_DURATION_SECONDS };
}

export function verificarToken(token: string): TokenPayload | null {
  const partes: string[] = token.split(".");
  if (partes.length !== 3) {
    return null;
  }
  const [header, payload, firma] = partes;
  const firmaEsperada: string = firmar(`${header}.${payload}`);

  const bufferRecibido: Buffer = Buffer.from(firma);
  const bufferEsperado: Buffer = Buffer.from(firmaEsperada);
  if (
    bufferRecibido.length !== bufferEsperado.length ||
    !timingSafeEqual(bufferRecibido, bufferEsperado)
  ) {
    return null;
  }

  let parsed: TokenPayload;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }

  const ahora: number = Math.floor(Date.now() / 1000);
  if (parsed.exp <= ahora) {
    return null;
  }

  return parsed;
}

/** Comparación en tiempo constante aunque los largos difieran. */
function compararSeguro(recibido: string, esperado: string): boolean {
  const hashRecibido: Buffer = createHash("sha256").update(recibido).digest();
  const hashEsperado: Buffer = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(hashRecibido, hashEsperado);
}

export function verificarCredenciales(email: string, password: string): boolean {
  const emailOk: boolean = compararSeguro(email, ADMIN_EMAIL);
  const passwordOk: boolean = compararSeguro(password, ADMIN_PASSWORD);
  return emailOk && passwordOk;
}
