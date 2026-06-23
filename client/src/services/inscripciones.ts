import { httpGet, httpPost, httpDelete, httpPatch } from "./http";
import type {
  CrearInscripcionRequest,
  Inscripcion,
  EstadoInscripciones,
  ListadoPorJuego,
  Juego,
} from "@shared/types/inscripcion";

export function crearInscripcion(payload: CrearInscripcionRequest): Promise<Inscripcion> {
  return httpPost<Inscripcion>("/inscripciones", payload);
}

export function getEstado(): Promise<EstadoInscripciones> {
  return httpGet<EstadoInscripciones>("/inscripciones/estado");
}

export function actualizarEstado(
  juego: Juego,
  abierta: boolean,
  token: string,
): Promise<{ abierta: boolean }> {
  return httpPatch<{ abierta: boolean }>("/inscripciones/estado", { juego, abierta }, token);
}

export function getListadoAdmin(token: string): Promise<ListadoPorJuego> {
  return httpGet<ListadoPorJuego>("/admin/inscripciones", token);
}

export function eliminarJugador(id: string, token: string): Promise<void> {
  return httpDelete<void>(`/admin/inscripciones/${id}`, token);
}

export interface JugadorPublico {
  id: string;
  nombreCompleto: string;
}

export function getJugadoresPublico(): Promise<JugadorPublico[]> {
  return httpGet<JugadorPublico[]>("/inscripciones/jugadores");
}
