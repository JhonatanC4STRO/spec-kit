import { Router } from "express";
import {
  generarGruposController,
  obtenerGruposController,
  registrarResultadoGrupoController,
  cerrarFaseController,
  reiniciarGruposController,
} from "../controllers/grupos.controller";
import { asyncHandler } from "../middleware/async-handler";

const publicRouter: Router = Router();
const adminRouter: Router = Router();

// Público: leer fase de grupos
publicRouter.get("/grupos/:juego", asyncHandler(obtenerGruposController));

// Admin: gestión completa
adminRouter.post("/grupos/:juego/generar", asyncHandler(generarGruposController));
adminRouter.post("/grupos/:juego/cerrar", asyncHandler(cerrarFaseController));
adminRouter.delete("/grupos/:juego", asyncHandler(reiniciarGruposController));
adminRouter.patch(
  "/grupos/partidos/:id/resultado",
  asyncHandler(registrarResultadoGrupoController),
);

export { publicRouter as gruposPublicRouter, adminRouter as gruposAdminRouter };
