export interface EquipoCod {
  id: string;
  apodo: string;
  jugador1Id: string;
  jugador2Id: string;
  jugador1Nombre?: string;
  jugador2Nombre?: string;
  createdAt: string;
}

export interface CrearEquipoCodInput {
  apodo: string;
  jugador1Id: string;
  jugador2Id: string;
}
