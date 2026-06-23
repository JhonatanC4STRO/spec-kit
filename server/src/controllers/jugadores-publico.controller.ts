import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Devuelve id + nombreCompleto + juego de todos los jugadores (sin datos sensibles). */
export async function obtenerJugadoresPublico(
  _req: Request,
  res: Response,
): Promise<void> {
  const jugadores = await prisma.inscripcion.findMany({
    select: { id: true, nombreCompleto: true, juego: true },
    orderBy: { createdAt: "asc" },
  });
  res.status(200).json(jugadores);
}
