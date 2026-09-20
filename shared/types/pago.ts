export type EstadoPagoInscripcion = "PENDIENTE_PAGO" | "PAGADA";

export type MetodoPago = "SIN_SELECCION" | "EPAYCO" | "EFECTIVO";

export type EstadoPago = "PENDIENTE" | "EN_PROCESO" | "PAGADO" | "RECHAZADO" | "FALLIDO";

export interface PagoResumen {
  id: string;
  inscripcionId: string;
  monto: string;
  moneda: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  referenciaInterna: string;
  epaycoRefPayco?: string | null;
  epaycoResponse?: string | null;
  fechaConfirmacion?: string | null;
}

export interface CrearSesionEpaycoResponse {
  pagoId: string;
  sessionId: string;
  test: boolean;
}

export interface SeleccionarEfectivoResponse {
  id: string;
  metodo: "EFECTIVO";
  estado: "PENDIENTE";
}
