import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";
import { PrismaClient, Administrador } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
const SESSION_DURATION_SECONDS: number = 600;
const HASH_DUMMY: string =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8O6tIPnL9bxN.5qK0pUYqaWdJxKi9q";

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

export async function verificarCredenciales(
  email: string,
  password: string,
): Promise<Administrador | null> {
  const admin = await prisma.administrador.findUnique({ where: { email } });

  if (admin === null) {
    await bcrypt.compare(password, HASH_DUMMY);
    return null;
  }

  const coincide: boolean = await bcrypt.compare(password, admin.passwordHash);
  return coincide ? admin : null;
}
