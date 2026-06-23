import { PrismaClient, Inscripcion, Juego, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const JUEGOS_VALIDOS: readonly Juego[] = ["FC25", "COD_BO2"];

export class CamposIncompletosError extends Error {}
export class JuegoInvalidoError extends Error {}
export class NicknameDuplicadoError extends Error {}
export class InscripcionesCerradasError extends Error {}

export interface CrearInscripcionInput {
  nombreCompleto: string;
  nickname: string;
  juego: string;
}

export function normalizarNickname(nickname: string): string {
  return nickname.trim().toLowerCase();
}

function validarCampos(input: CrearInscripcionInput): void {
  if (
    input.nombreCompleto.trim() === "" ||
    input.nickname.trim() === "" ||
    input.juego.trim() === ""
  ) {
    throw new CamposIncompletosError("Todos los campos son requeridos");
  }
  if (!JUEGOS_VALIDOS.includes(input.juego as Juego)) {
    throw new JuegoInvalidoError("Juego inválido");
  }
}

export async function crear(input: CrearInscripcionInput): Promise<Inscripcion> {
  validarCampos(input);

  const estado = await obtenerEstado();
  if (!estado.abierta) {
    throw new InscripcionesCerradasError("Las inscripciones están cerradas");
  }

  try {
    return await prisma.inscripcion.create({
      data: {
        nombreCompleto: input.nombreCompleto,
        nickname: input.nickname,
        nicknameNormalizado: normalizarNickname(input.nickname),
        juego: input.juego as Juego,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new NicknameDuplicadoError(
        "El nickname ya está registrado para este juego",
      );
    }
    throw error;
  }
}

export async function obtenerEstado(): Promise<{ abierta: boolean }> {
  const estado = await prisma.estadoInscripciones.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", abierta: true },
  });
  return { abierta: estado.abierta };
}

export async function actualizarEstado(abierta: boolean): Promise<{ abierta: boolean }> {
  const estado = await prisma.estadoInscripciones.upsert({
    where: { id: "global" },
    update: { abierta },
    create: { id: "global", abierta },
  });
  return { abierta: estado.abierta };
}

export interface ListadoPorJuego {
  FC25: Inscripcion[];
  COD_BO2: Inscripcion[];
}

export async function listarAgrupadoPorJuego(): Promise<ListadoPorJuego> {
  const inscripciones = await prisma.inscripcion.findMany({
    orderBy: { createdAt: "asc" },
  });

  return {
    FC25: inscripciones.filter((i): boolean => i.juego === "FC25"),
    COD_BO2: inscripciones.filter((i): boolean => i.juego === "COD_BO2"),
  };
}

export async function eliminar(id: string): Promise<void> {
  try {
    await prisma.inscripcion.delete({ where: { id } });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return;
    }
    throw error;
  }
}
