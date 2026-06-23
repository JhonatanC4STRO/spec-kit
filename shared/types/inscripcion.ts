export type Juego = "FC25" | "COD_BO2";

export interface Inscripcion {
  id: string;
  nombreCompleto: string;
  nickname: string | null;
  documento?: string | null;
  juego: Juego;
  createdAt: string;

  // COD BO2 team fields
  jugador1Nombre?: string | null;
  jugador2Nombre?: string | null;
  ficha?: string | null;
  programa?: string | null;
  correo?: string | null;
  telefono?: string | null;
  nickEquipo?: string | null;
}

export interface CrearInscripcionRequest {
  nombreCompleto: string;
  nickname?: string;
  documento?: string;
  juego: Juego;

  // COD BO2 team fields
  jugador1Nombre?: string;
  jugador2Nombre?: string;
  ficha?: string;
  programa?: string;
  correo?: string;
  telefono?: string;
  nickEquipo?: string;
}

export interface EstadoInscripciones {
  FC25: { abierta: boolean };
  COD_BO2: { abierta: boolean };
}

export interface ListadoPorJuego {
  FC25: Inscripcion[];
  COD_BO2: Inscripcion[];
}

