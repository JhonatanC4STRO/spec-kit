import { PrismaClient, Inscripcion as PrismaInscripcion, Juego, Pago, Prisma } from "@prisma/client";
import { crearPagoPendiente, serializarPago } from "./pagos";
import type { CrearInscripcionResponse, Inscripcion as InscripcionDto } from "@shared/types/inscripcion";

const prisma = new PrismaClient();

const JUEGOS_VALIDOS: readonly Juego[] = ["FC25", "COD_BO2"];

/**
 * Techo de inscritos por juego. Mantenerlo en potencia de 2 evita byes en el
 * bracket de eliminación simple/doble (ver `services/bracket.ts`).
 */
const CUPO_MAXIMO_POR_JUEGO = 32;

/**
 * Mínimo de inscritos para que el cierre automático aplique: 1 y 2 también son
 * potencias de 2, pero cerrar ahí dejaría un torneo sin bracket viable.
 */
const MINIMO_CIERRE_AUTOMATICO = 4;

export class CamposIncompletosError extends Error {}
export class JuegoInvalidoError extends Error {}
export class NicknameDuplicadoError extends Error {}
export class DocumentoDuplicadoError extends Error {}
export class InscripcionesCerradasError extends Error {}
export class CupoCompletoError extends Error {}

export interface CrearInscripcionInput {
  nombreCompleto: string;
  nickname?: string;
  documento?: string;
  juego: string;
  // COD BO2 team fields
  jugador1Nombre?: string;
  jugador2Nombre?: string;
  ficha?: string;
  programa?: string;
  correo?: string;
  telefono?: string;
  nickEquipo?: string;
}

export function normalizarNickname(nickname: string): string {
  return nickname.trim().toLowerCase();
}

function validarCampos(input: CrearInscripcionInput): void {
  if (!input.juego || input.juego.trim() === "") {
    throw new CamposIncompletosError("El juego es requerido");
  }
  if (!JUEGOS_VALIDOS.includes(input.juego as Juego)) {
    throw new JuegoInvalidoError("Juego inválido");
  }

  if (input.juego === "FC25") {
    if (
      input.nombreCompleto.trim() === "" ||
      !input.nickname || input.nickname.trim() === "" ||
      !input.documento || input.documento.trim() === "" ||
      !input.ficha || input.ficha.trim() === "" ||
      !input.programa || input.programa.trim() === "" ||
      !input.correo || input.correo.trim() === "" ||
      !input.telefono || input.telefono.trim() === ""
    ) {
      throw new CamposIncompletosError("Todos los campos son requeridos");
    }
  } else if (input.juego === "COD_BO2") {
    if (
      !input.nickname || input.nickname.trim() === "" ||
      !input.jugador1Nombre || input.jugador1Nombre.trim() === "" ||
      !input.jugador2Nombre || input.jugador2Nombre.trim() === "" ||
      !input.ficha || input.ficha.trim() === "" ||
      !input.programa || input.programa.trim() === "" ||
      !input.correo || input.correo.trim() === "" ||
      !input.telefono || input.telefono.trim() === ""
    ) {
      throw new CamposIncompletosError("Todos los campos obligatorios del equipo y representante son requeridos");
    }
  }
}

function esPotenciaDeDos(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export async function crear(input: CrearInscripcionInput): Promise<CrearInscripcionResponse> {
  validarCampos(input);
  const juego = input.juego as Juego;

  const estado = await obtenerEstadoJuego(juego);
  if (!estado.abierta) {
    throw new InscripcionesCerradasError("Las inscripciones están cerradas para este juego");
  }

  const inscritosDelJuego = await prisma.inscripcion.count({ where: { juego } });
  if (inscritosDelJuego >= CUPO_MAXIMO_POR_JUEGO) {
    throw new CupoCompletoError(
      `Cupo completo para este juego (máximo ${CUPO_MAXIMO_POR_JUEGO} jugadores)`,
    );
  }

  let creada: PrismaInscripcion;
  let pago: Pago | null = null;
  try {
    const nicknameTrim = input.nickname?.trim() || null;
    const data: Prisma.InscripcionCreateInput = {
      nombreCompleto: juego === "COD_BO2" ? (nicknameTrim ?? "") : input.nombreCompleto,
      nickname: nicknameTrim,
      nicknameNormalizado: nicknameTrim ? normalizarNickname(nicknameTrim) : null,
      documento: input.documento?.trim() || null,
      ficha: input.ficha?.trim() || null,
      programa: input.programa?.trim() || null,
      correo: input.correo?.trim() || null,
      telefono: input.telefono?.trim() || null,
      juego,
    };

    if (juego === "COD_BO2") {
      data.jugador1Nombre = input.jugador1Nombre?.trim();
      data.jugador2Nombre = input.jugador2Nombre?.trim();
      data.nickEquipo = input.nickEquipo?.trim() || null;
    }

    const resultado = await prisma.$transaction(
      async (tx): Promise<{ inscripcion: PrismaInscripcion; pago: Pago }> => {
      const inscripcion = await tx.inscripcion.create({ data });
      const pagoPendiente = await crearPagoPendiente(tx, inscripcion.id);
      return { inscripcion, pago: pagoPendiente };
    });
    creada = resultado.inscripcion;
    pago = resultado.pago;
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // `meta.target` indica qué índice único se violó; si involucra el
      // documento devolvemos un error específico, de lo contrario es el apodo.
      const target = String(error.meta?.target ?? "");
      if (target.includes("documento")) {
        throw new DocumentoDuplicadoError(
          "Ya existe un jugador inscrito con ese número de documento",
        );
      }
      const msg = juego === "COD_BO2"
        ? "El nombre de equipo ya está registrado para este juego"
        : "El apodo ya está registrado para este juego";
      throw new NicknameDuplicadoError(msg);
    }
    throw error;
  }

  // Cierre automático al tocar una potencia de 2 (4, 8, 16, 32): evita byes
  // en el bracket si el admin genera apenas se completa el cupo redondo.
  const totalTrasCrear = inscritosDelJuego + 1;
  if (totalTrasCrear >= MINIMO_CIERRE_AUTOMATICO && esPotenciaDeDos(totalTrasCrear)) {
    await actualizarEstado(juego, false);
  }

  if (pago === null) {
    throw new Error("No se pudo crear el pago de la inscripción");
  }

  return {
    inscripcion: serializarInscripcion(creada),
    pago: serializarPago(pago),
  };
}

function serializarInscripcion(inscripcion: PrismaInscripcion): InscripcionDto {
  return {
    id: inscripcion.id,
    nombreCompleto: inscripcion.nombreCompleto,
    nickname: inscripcion.nickname,
    documento: inscripcion.documento,
    juego: inscripcion.juego,
    estadoPago: inscripcion.estadoPago,
    createdAt: inscripcion.createdAt.toISOString(),
    jugador1Nombre: inscripcion.jugador1Nombre,
    jugador2Nombre: inscripcion.jugador2Nombre,
    ficha: inscripcion.ficha,
    programa: inscripcion.programa,
    correo: inscripcion.correo,
    telefono: inscripcion.telefono,
    nickEquipo: inscripcion.nickEquipo,
  };
}

export interface EstadoInscripcionesPorJuego {
  FC25: { abierta: boolean };
  COD_BO2: { abierta: boolean };
}

export async function obtenerEstadoJuego(juego: Juego): Promise<{ abierta: boolean }> {
  const estado = await prisma.estadoInscripciones.upsert({
    where: { juego },
    update: {},
    create: { juego, abierta: true },
  });
  return { abierta: estado.abierta };
}

export async function obtenerEstado(): Promise<EstadoInscripcionesPorJuego> {
  const [fc25, codBo2] = await Promise.all([
    obtenerEstadoJuego("FC25"),
    obtenerEstadoJuego("COD_BO2"),
  ]);
  return { FC25: fc25, COD_BO2: codBo2 };
}

export async function actualizarEstado(
  juego: Juego,
  abierta: boolean,
): Promise<{ abierta: boolean }> {
  const estado = await prisma.estadoInscripciones.upsert({
    where: { juego },
    update: { abierta },
    create: { juego, abierta },
  });
  return { abierta: estado.abierta };
}

type InscripcionConPago = PrismaInscripcion & { pago: Pago | null };

export interface ListadoPorJuego {
  FC25: InscripcionConPago[];
  COD_BO2: InscripcionConPago[];
}

export async function listarAgrupadoPorJuego(): Promise<ListadoPorJuego> {
  const inscripciones = await prisma.inscripcion.findMany({
    include: { pago: true },
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
