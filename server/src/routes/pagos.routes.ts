import { Router } from "express";
import {
  confirmarPagoEfectivoAdmin,
  iniciarSesionEpayco,
  obtenerPagoPorId,
  recibirConfirmacionEpayco,
  seleccionarPagoEfectivo,
} from "../controllers/pagos.controller";
import { asyncHandler } from "../middleware/async-handler";

export const pagosRouter: Router = Router();
export const pagosAdminRouter: Router = Router();

pagosRouter.get("/pagos/:id", asyncHandler(obtenerPagoPorId));
pagosRouter.post("/pagos/:id/epayco-session", asyncHandler(iniciarSesionEpayco));
pagosRouter.patch("/pagos/:id/efectivo", asyncHandler(seleccionarPagoEfectivo));
pagosRouter.post("/pagos/epayco/confirmacion", asyncHandler(recibirConfirmacionEpayco));

pagosAdminRouter.patch(
  "/pagos/:id/efectivo/confirmar",
  asyncHandler(confirmarPagoEfectivoAdmin),
);
