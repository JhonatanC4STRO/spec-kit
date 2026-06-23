import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async-handler";

const router: Router = Router();

router.post("/admin/login", asyncHandler(login));

export default router;
