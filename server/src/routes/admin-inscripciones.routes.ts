import { Router } from "express";
import {
  obtenerListadoAdmin,
  eliminarInscripcion,
} from "../controllers/admin-inscripciones.controller";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.get("/inscripciones", asyncHandler(obtenerListadoAdmin));
router.delete("/inscripciones/:id", asyncHandler(eliminarInscripcion));

export default router;
