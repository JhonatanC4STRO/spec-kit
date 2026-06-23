import { Request, Response } from "express";
import {
  generarBracket,
  InscripcionesAbiertasError,
  BracketYaExisteError,
  JugadoresInsuficientesError,
} from "../services/bracket";

export async function generar(req: Request, res: Response): Promise<void> {
  try {
    const bracket = await generarBracket(req.params.juego);
    res.status(201).json(bracket);
  } catch (error: unknown) {
    if (error instanceof JugadoresInsuficientesError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof InscripcionesAbiertasError || error instanceof BracketYaExisteError) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}
