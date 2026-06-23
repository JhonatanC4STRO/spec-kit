import { Request, Response, NextFunction } from "express";
import { verificarToken } from "../services/auth";

declare module "express-serve-static-core" {
  interface Request {
    adminId?: string;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header: string | undefined = req.headers.authorization;

  if (header === undefined || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token: string = header.slice("Bearer ".length);
  const payload = verificarToken(token);

  if (payload === null) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  req.adminId = payload.adminId;
  next();
}
