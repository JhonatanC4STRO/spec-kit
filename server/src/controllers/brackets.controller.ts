import { Request, Response } from "express";
import { getBracket, BracketNoEncontradoError } from "../services/bracket";

export async function obtener(req: Request, res: Response): Promise<void> {
  try {
    const bracket = await getBracket(req.params.juego);
    res.status(200).json(bracket);
  } catch (error: unknown) {
    if (error instanceof BracketNoEncontradoError) {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}
