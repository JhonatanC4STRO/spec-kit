export type Juego = "FC25" | "COD_BO2";

export interface Inscripcion {
  id: string;
  nombreCompleto: string;
  nickname: string;
  juego: Juego;
  createdAt: string;
}

export interface CrearInscripcionRequest {
  nombreCompleto: string;
  nickname: string;
  juego: Juego;
}

export interface EstadoInscripciones {
  abierta: boolean;
}

export interface ListadoPorJuego {
  FC25: Inscripcion[];
  COD_BO2: Inscripcion[];
}
