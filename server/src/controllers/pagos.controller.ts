import { Request, Response } from "express";
import {
  ConfiguracionPagoError,
  ConfirmacionInvalidaError,
  EpaycoError,
  PagoNoElegibleError,
  PagoNoEncontradoError,
  confirmarEfectivoAdmin,
  crearSesionEpayco,
  obtenerPago,
  procesarConfirmacionEpayco,
  seleccionarEfectivo,
} from "../services/pagos";

export async function obtenerPagoPorId(req: Request, res: Response): Promise<void> {
  try {
    const pago = await obtenerPago(req.params.id);
    res.status(200).json(pago);
  } catch (error: unknown) {
    responderErrorPago(error, res);
  }
}

export async function iniciarSesionEpayco(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await crearSesionEpayco(req.params.id);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    responderErrorPago(error, res);
  }
}

export async function seleccionarPagoEfectivo(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await seleccionarEfectivo(req.params.id);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    responderErrorPago(error, res);
  }
}

export async function confirmarPagoEfectivoAdmin(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await confirmarEfectivoAdmin(req.params.id);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    responderErrorPago(error, res);
  }
}

export async function recibirConfirmacionEpayco(req: Request, res: Response): Promise<void> {
  try {
    await procesarConfirmacionEpayco(req.body);
    res.status(200).send("OK");
  } catch (error: unknown) {
    if (error instanceof ConfirmacionInvalidaError) {
      res.status(400).send(error.message);
      return;
    }
    if (error instanceof PagoNoEncontradoError) {
      res.status(404).send(error.message);
      return;
    }
    if (error instanceof ConfiguracionPagoError) {
      res.status(503).send(error.message);
      return;
    }
    throw error;
  }
}

function responderErrorPago(error: unknown, res: Response): void {
  if (error instanceof PagoNoEncontradoError) {
    res.status(404).json({ error: error.message });
    return;
  }
  if (error instanceof PagoNoElegibleError || error instanceof ConfirmacionInvalidaError) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof ConfiguracionPagoError) {
    res.status(503).json({ error: error.message });
    return;
  }
  if (error instanceof EpaycoError) {
    res.status(502).json({ error: error.message });
    return;
  }
  throw error;
}
