import { Request, Response } from "express";
import {
  crear,
  obtenerEstado,
  actualizarEstado,
  CamposIncompletosError,
  JuegoInvalidoError,
  NicknameDuplicadoError,
  InscripcionesCerradasError,
} from "../services/inscripciones";

export async function crearInscripcion(req: Request, res: Response): Promise<void> {
  try {
    const inscripcion = await crear({
      nombreCompleto: String(req.body?.nombreCompleto ?? ""),
      nickname: String(req.body?.nickname ?? ""),
      juego: String(req.body?.juego ?? ""),
    });
    res.status(201).json(inscripcion);
  } catch (error: unknown) {
    if (error instanceof CamposIncompletosError || error instanceof JuegoInvalidoError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NicknameDuplicadoError) {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error instanceof InscripcionesCerradasError) {
      res.status(423).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function obtenerEstadoInscripciones(_req: Request, res: Response): Promise<void> {
  const estado = await obtenerEstado();
  res.status(200).json(estado);
}

export async function actualizarEstadoInscripciones(req: Request, res: Response): Promise<void> {
  if (typeof req.body?.abierta !== "boolean") {
    res.status(400).json({ error: "El campo 'abierta' debe ser booleano" });
    return;
  }
  const estado = await actualizarEstado(req.body.abierta as boolean);
  res.status(200).json(estado);
}
