import { Router } from "express";
import { generar } from "../controllers/admin-bracket.controller";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.post("/brackets/:juego/generar", asyncHandler(generar));

export default router;
