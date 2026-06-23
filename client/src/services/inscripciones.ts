import { httpGet, httpPost, httpDelete, httpPatch } from "./http";
import type {
  CrearInscripcionRequest,
  Inscripcion,
  EstadoInscripciones,
  ListadoPorJuego,
} from "@shared/types/inscripcion";

export function crearInscripcion(payload: CrearInscripcionRequest): Promise<Inscripcion> {
  return httpPost<Inscripcion>("/inscripciones", payload);
}

export function getEstado(): Promise<EstadoInscripciones> {
  return httpGet<EstadoInscripciones>("/inscripciones/estado");
}

export function actualizarEstado(
  abierta: boolean,
  token: string,
): Promise<EstadoInscripciones> {
  return httpPatch<EstadoInscripciones>("/inscripciones/estado", { abierta }, token);
}

export function getListadoAdmin(token: string): Promise<ListadoPorJuego> {
  return httpGet<ListadoPorJuego>("/admin/inscripciones", token);
}

export function eliminarJugador(id: string, token: string): Promise<void> {
  return httpDelete<void>(`/admin/inscripciones/${id}`, token);
}
