import { Request, Response } from "express";
import {
  crear,
  obtenerEstado,
  actualizarEstado,
  CamposIncompletosError,
  JuegoInvalidoError,
  NicknameDuplicadoError,
  InscripcionesCerradasError,
  CupoCompletoError,
  CrearInscripcionInput,
} from "../services/inscripciones";

export async function crearInscripcion(req: Request, res: Response): Promise<void> {
  try {
    const input: CrearInscripcionInput = {
      nombreCompleto: String(req.body?.nombreCompleto ?? ""),
      nickname: String(req.body?.nickname ?? ""),
      documento: String(req.body?.documento ?? ""),
      ficha: String(req.body?.ficha ?? ""),
      programa: String(req.body?.programa ?? ""),
      correo: String(req.body?.correo ?? ""),
      telefono: String(req.body?.telefono ?? ""),
      juego: String(req.body?.juego ?? ""),
    };

    if (req.body?.juego === "COD_BO2") {
      input.jugador1Nombre = String(req.body?.jugador1Nombre ?? "");
      input.jugador2Nombre = String(req.body?.jugador2Nombre ?? "");
      input.nickEquipo = String(req.body?.nickEquipo ?? "");
    }

    const inscripcion = await crear(input);
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
    if (error instanceof CupoCompletoError) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}

const JUEGOS_VALIDOS = ["FC25", "COD_BO2"] as const;

export async function obtenerEstadoInscripciones(_req: Request, res: Response): Promise<void> {
  const estado = await obtenerEstado();
  res.status(200).json(estado);
}

export async function actualizarEstadoInscripciones(req: Request, res: Response): Promise<void> {
  if (typeof req.body?.abierta !== "boolean") {
    res.status(400).json({ error: "El campo 'abierta' debe ser booleano" });
    return;
  }
  const juego = req.body?.juego;
  if (typeof juego !== "string" || !JUEGOS_VALIDOS.includes(juego as (typeof JUEGOS_VALIDOS)[number])) {
    res.status(400).json({ error: "El campo 'juego' debe ser FC25 o COD_BO2" });
    return;
  }
  const estado = await actualizarEstado(
    juego as (typeof JUEGOS_VALIDOS)[number],
    req.body.abierta as boolean,
  );
  res.status(200).json(estado);
}
