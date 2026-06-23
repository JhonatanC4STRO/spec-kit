import { Request, Response } from "express";
import {
  generarFaseGrupos,
  getFaseGrupos,
  getJuegoDePartidoGrupo,
  registrarResultadoPartidoGrupo,
  cerrarFaseGrupos,
  reiniciarFaseGrupos,
  FaseGruposYaExisteError,
  FaseGruposNoEncontradaError,
  PartidoGrupoNoEncontradoError,
  FaseGruposYaFinalizadaError,
  JugadoresInsuficientesGruposError,
} from "../services/grupos";
import { generarBracket, BracketYaExisteError } from "../services/bracket";
import type { ResultadoPartidoGrupoInput } from "@shared/types/grupos";

export async function generarGruposController(req: Request, res: Response): Promise<void> {
  try {
    const result = await generarFaseGrupos(req.params.juego);
    res.status(201).json(result);
  } catch (err: unknown) {
    if (err instanceof FaseGruposYaExisteError) {
      res.status(409).json({ error: err.message });
      return;
    }
    if (err instanceof JugadoresInsuficientesGruposError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function obtenerGruposController(req: Request, res: Response): Promise<void> {
  try {
    const fase = await getFaseGrupos(req.params.juego);
    res.status(200).json(fase);
  } catch (err: unknown) {
    if (err instanceof FaseGruposNoEncontradaError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function registrarResultadoGrupoController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const input = req.body as ResultadoPartidoGrupoInput;
    await registrarResultadoPartidoGrupo(req.params.id, input);
    // Obtener el juego desde el partido para devolver la fase actualizada
    const juego = await getJuegoDePartidoGrupo(req.params.id);
    if (juego === null) {
      res.status(404).json({ error: "Partido de grupo no encontrado" });
      return;
    }
    const fase = await getFaseGrupos(juego);
    res.status(200).json(fase);
  } catch (err: unknown) {
    if (err instanceof PartidoGrupoNoEncontradoError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof FaseGruposYaFinalizadaError) {
      res.status(409).json({ error: err.message });
      return;
    }
    throw err;
  }
}

/**
 * Cierra la fase de grupos y genera automáticamente el bracket con los clasificados.
 */
export async function cerrarFaseController(req: Request, res: Response): Promise<void> {
  try {
    const clasificados = await cerrarFaseGrupos(req.params.juego);
    // Generar el bracket con los clasificados
    const bracket = await generarBracket(req.params.juego, clasificados);
    res.status(200).json({ clasificados, bracket });
  } catch (err: unknown) {
    if (err instanceof FaseGruposNoEncontradaError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof FaseGruposYaFinalizadaError || err instanceof BracketYaExisteError) {
      res.status(409).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function reiniciarGruposController(req: Request, res: Response): Promise<void> {
  try {
    await reiniciarFaseGrupos(req.params.juego);
    res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof FaseGruposNoEncontradaError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}
