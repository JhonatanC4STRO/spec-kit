import { Router } from "express";
import {
  crearInscripcion,
  obtenerEstadoInscripciones,
  actualizarEstadoInscripciones,
} from "../controllers/inscripciones.controller";
import { obtenerJugadoresPublico } from "../controllers/jugadores-publico.controller";
import { requireAdmin } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.post("/inscripciones", asyncHandler(crearInscripcion));
router.get("/inscripciones/estado", asyncHandler(obtenerEstadoInscripciones));
router.get("/inscripciones/jugadores", asyncHandler(obtenerJugadoresPublico));
router.patch(
  "/inscripciones/estado",
  requireAdmin,
  asyncHandler(actualizarEstadoInscripciones),
);

export default router;
