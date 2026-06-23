import { Router } from "express";
import { obtener } from "../controllers/brackets.controller";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.get("/brackets/:juego", asyncHandler(obtener));

export default router;
