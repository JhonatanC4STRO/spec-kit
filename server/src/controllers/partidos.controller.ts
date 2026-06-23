import { Request, Response } from "express";
import {
  avanzarGanador,
  PartidoNoEncontradoError,
  JugadoresIncompletosError,
  VentanaEdicionCerradaError,
} from "../services/bracket";
import { ResultadoInvalidoError, ResultadoPartidoInput } from "../services/partido-validation";

export async function registrarResultado(req: Request, res: Response): Promise<void> {
  try {
    const resultado = req.body as ResultadoPartidoInput;
    const avance = await avanzarGanador(req.params.id, resultado);
    res.status(200).json(avance);
  } catch (error: unknown) {
    if (error instanceof ResultadoInvalidoError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof PartidoNoEncontradoError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (
      error instanceof JugadoresIncompletosError ||
      error instanceof VentanaEdicionCerradaError
    ) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}
