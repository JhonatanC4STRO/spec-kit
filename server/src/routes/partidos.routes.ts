import { Router } from "express";
import { registrarResultado } from "../controllers/partidos.controller";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.patch("/:id/resultado", asyncHandler(registrarResultado));

export default router;
