import { Request, Response } from "express";
import { verificarCredenciales, generarToken } from "../services/auth";

export async function login(req: Request, res: Response): Promise<void> {
  const email: string = String(req.body?.email ?? "").trim();
  const password: string = String(req.body?.password ?? "");

  if (email === "" || password === "") {
    res.status(400).json({ error: "Email y contraseña son requeridos" });
    return;
  }

  const admin = await verificarCredenciales(email, password);

  if (admin === null) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const { token, expiresInSeconds } = generarToken(admin.id);
  res.status(200).json({ token, expiresInSeconds });
}
