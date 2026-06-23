import { httpGet, httpPost, httpDelete, httpPatch } from "./http";
import type { FaseGruposConGrupos, ResultadoPartidoGrupoInput } from "@shared/types/grupos";

// ─── Público ──────────────────────────────────────────────────────────────────

export function getFaseGrupos(juego: string): Promise<FaseGruposConGrupos> {
  return httpGet<FaseGruposConGrupos>(`/grupos/${juego}`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function generarFaseGrupos(
  juego: string,
  token: string,
): Promise<{ id: string }> {
  return httpPost<{ id: string }>(`/admin/grupos/${juego}/generar`, {}, token);
}

export function cerrarFaseGrupos(
  juego: string,
  token: string,
): Promise<{ clasificados: string[]; bracket: { id: string } }> {
  return httpPost<{ clasificados: string[]; bracket: { id: string } }>(
    `/admin/grupos/${juego}/cerrar`,
    {},
    token,
  );
}

export function reiniciarFaseGrupos(juego: string, token: string): Promise<void> {
  return httpDelete<void>(`/admin/grupos/${juego}`, token);
}

export function registrarResultadoGrupo(
  partidoId: string,
  input: ResultadoPartidoGrupoInput,
  token: string,
): Promise<FaseGruposConGrupos> {
  return httpPatch<FaseGruposConGrupos>(
    `/admin/grupos/partidos/${partidoId}/resultado`,
    input,
    token,
  );
}
