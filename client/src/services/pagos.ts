import { httpGet, httpPatch, httpPost } from "./http";
import type {
  CrearSesionEpaycoResponse,
  PagoResumen,
  SeleccionarEfectivoResponse,
} from "@shared/types/pago";

export function getPago(id: string): Promise<PagoResumen> {
  return httpGet<PagoResumen>(`/pagos/${id}`);
}

export function crearSesionEpayco(id: string): Promise<CrearSesionEpaycoResponse> {
  return httpPost<CrearSesionEpaycoResponse>(`/pagos/${id}/epayco-session`, {});
}

export function seleccionarPagoEfectivo(id: string): Promise<SeleccionarEfectivoResponse> {
  return httpPatch<SeleccionarEfectivoResponse>(`/pagos/${id}/efectivo`, {});
}

export function confirmarPagoEfectivo(id: string, token: string): Promise<PagoResumen> {
  return httpPatch<PagoResumen>(`/admin/pagos/${id}/efectivo/confirmar`, {}, token);
}
