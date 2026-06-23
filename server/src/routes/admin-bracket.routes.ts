import { Router } from "express";
import { generar, reiniciar } from "../controllers/admin-bracket.controller";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.post("/brackets/:juego/generar", asyncHandler(generar));
router.delete("/brackets/:juego", asyncHandler(reiniciar));

export default router;
