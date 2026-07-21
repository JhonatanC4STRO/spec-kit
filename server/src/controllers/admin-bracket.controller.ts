import { Request, Response } from "express";
import {
  generarBracket,
  reiniciarBracket,
  InscripcionesAbiertasError,
  BracketYaExisteError,
  JugadoresInsuficientesError,
  CantidadInvalidaError,
  BracketNoEncontradoError,
} from "../services/bracket";

export async function generar(req: Request, res: Response): Promise<void> {
  try {
    const bracket = await generarBracket(req.params.juego);
    res.status(201).json(bracket);
  } catch (error: unknown) {
    if (error instanceof JugadoresInsuficientesError || error instanceof CantidadInvalidaError) {
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

export async function reiniciar(req: Request, res: Response): Promise<void> {
  try {
    await reiniciarBracket(req.params.juego);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof BracketNoEncontradoError) {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}
