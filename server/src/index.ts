import express, { Express, Request, Response, NextFunction } from "express";
import inscripcionesRouter from "./routes/inscripciones.routes";
import authRouter from "./routes/auth.routes";
import adminInscripcionesRouter from "./routes/admin-inscripciones.routes";
import adminBracketRouter from "./routes/admin-bracket.routes";
import bracketsRouter from "./routes/brackets.routes";
import partidosRouter from "./routes/partidos.routes";
import { gruposPublicRouter, gruposAdminRouter } from "./routes/grupos.routes";
import { requireAdmin } from "./middleware/auth.middleware";

const app: Express = express();

app.use(express.json());

app.use("/api", inscripcionesRouter);
app.use("/api", authRouter);
app.use("/api", bracketsRouter);
// Fase de grupos — GET público
app.use("/api", gruposPublicRouter);
// Fase de grupos — acciones de admin
app.use("/api/admin", requireAdmin, gruposAdminRouter);
app.use("/api/admin", requireAdmin, adminInscripcionesRouter);
app.use("/api/admin", requireAdmin, adminBracketRouter);
app.use("/api/partidos", requireAdmin, partidosRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err);
  if (err.name === "PrismaClientInitializationError") {
    res.status(503).json({ error: "Base de datos no disponible" });
    return;
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, (): void => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

export default app;
