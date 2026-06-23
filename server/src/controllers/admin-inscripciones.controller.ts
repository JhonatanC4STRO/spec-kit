import { Request, Response } from "express";
import { listarAgrupadoPorJuego, eliminar } from "../services/inscripciones";

export async function obtenerListadoAdmin(_req: Request, res: Response): Promise<void> {
  const listado = await listarAgrupadoPorJuego();
  res.status(200).json(listado);
}

export async function eliminarInscripcion(req: Request, res: Response): Promise<void> {
  await eliminar(req.params.id);
  res.status(204).send();
}
