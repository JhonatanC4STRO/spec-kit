import crypto from "crypto";
import {
  EstadoPago,
  Inscripcion,
  Pago,
  Prisma,
  PrismaClient,
  TipoEventoPago,
} from "@prisma/client";
import type { CrearSesionEpaycoResponse, PagoResumen, SeleccionarEfectivoResponse } from "@shared/types/pago";

const prisma = new PrismaClient();

const DEFAULT_EPAYCO_BASE_URL = "https://apify.epayco.co";
const DEFAULT_CURRENCY = "COP";
const CENTS_PER_UNIT = 100;

type TransactionClient = Prisma.TransactionClient;
type PagoConInscripcion = Pago & { inscripcion: Inscripcion };
type UnknownRecord = Record<string, unknown>;

export class PagoNoEncontradoError extends Error {}
export class PagoNoElegibleError extends Error {}
export class ConfiguracionPagoError extends Error {}
export class EpaycoError extends Error {}
export class ConfirmacionInvalidaError extends Error {}

interface ConfiguracionPagos {
  amountCents: number;
  currency: string;
}

interface ConfiguracionEpayco {
  publicKey: string;
  privateKey: string;
  customerId: string;
  pKey: string;
  test: boolean;
  baseUrl: string;
  appPublicUrl: string;
}

interface EpaycoLoginResponse {
  token: string;
}

interface EpaycoSessionResponse {
  data: {
    sessionId: string;
  };
}

interface ConfirmacionEpayco {
  refPayco: string;
  xRefPayco: string;
  transactionId: string;
  response: string;
  responseReasonText: string | null;
  amount: string;
  currency: string;
  franchise: string | null;
  signature: string;
  approvalCode: string | null;
  transactionDate: string | null;
  transactionState: string | null;
  paymentId: string | null;
  internalReference: string | null;
}

export function serializarPago(pago: Pago): PagoResumen {
  return {
    id: pago.id,
    inscripcionId: pago.inscripcionId,
    monto: pago.monto.toString(),
    moneda: pago.moneda,
    metodo: pago.metodo,
    estado: pago.estado,
    referenciaInterna: pago.referenciaInterna,
    epaycoRefPayco: pago.epaycoRefPayco,
    epaycoResponse: pago.epaycoResponse,
    fechaConfirmacion: pago.fechaConfirmacion?.toISOString() ?? null,
  };
}

export function obtenerConfiguracionPagos(): ConfiguracionPagos {
  const amountCentsRaw = process.env.INSCRIPCION_PRICE_CENTS;
  const amountCents = Number(amountCentsRaw);

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new ConfiguracionPagoError(
      "INSCRIPCION_PRICE_CENTS debe ser un entero mayor que 0",
    );
  }

  const currency = (process.env.INSCRIPCION_CURRENCY ?? DEFAULT_CURRENCY).trim().toUpperCase();
  if (currency === "") {
    throw new ConfiguracionPagoError("INSCRIPCION_CURRENCY no puede estar vacío");
  }

  return { amountCents, currency };
}

export async function crearPagoPendiente(
  tx: TransactionClient,
  inscripcionId: string,
): Promise<Pago> {
  const config = obtenerConfiguracionPagos();
  const referenciaInterna = crearReferenciaInterna();
  const pago = await tx.pago.create({
    data: {
      inscripcionId,
      monto: new Prisma.Decimal(config.amountCents).div(CENTS_PER_UNIT),
      moneda: config.currency,
      referenciaInterna,
      eventos: {
        create: {
          tipo: "CREADO",
          detalle: {
            referenciaInterna,
            monto: config.amountCents,
            moneda: config.currency,
          },
        },
      },
    },
  });

  return pago;
}

export async function obtenerPago(id: string): Promise<PagoResumen> {
  const pago = await prisma.pago.findUnique({ where: { id } });
  if (pago === null) {
    throw new PagoNoEncontradoError("Pago no encontrado");
  }
  return serializarPago(pago);
}

export async function seleccionarEfectivo(id: string): Promise<SeleccionarEfectivoResponse> {
  const pago = await prisma.pago.findUnique({ where: { id } });
  if (pago === null) {
    throw new PagoNoEncontradoError("Pago no encontrado");
  }
  if (pago.estado === "PAGADO") {
    throw new PagoNoElegibleError("El pago ya está confirmado");
  }

  const actualizado = await prisma.pago.update({
    where: { id },
    data: {
      metodo: "EFECTIVO",
      estado: "PENDIENTE",
      eventos: {
        create: {
          tipo: "METODO_EFECTIVO",
          detalle: { metodo: "EFECTIVO" },
        },
      },
    },
  });

  return {
    id: actualizado.id,
    metodo: "EFECTIVO",
    estado: "PENDIENTE",
  };
}

export async function confirmarEfectivoAdmin(id: string): Promise<PagoResumen> {
  const pago = await prisma.pago.findUnique({ where: { id } });
  if (pago === null) {
    throw new PagoNoEncontradoError("Pago no encontrado");
  }
  if (pago.metodo !== "EFECTIVO" || pago.estado === "PAGADO") {
    throw new PagoNoElegibleError("Solo se pueden confirmar pagos en efectivo pendientes");
  }

  const actualizado = await prisma.$transaction(async (tx): Promise<Pago> => {
    const pagoActualizado = await tx.pago.update({
      where: { id },
      data: {
        estado: "PAGADO",
        fechaConfirmacion: new Date(),
        eventos: {
          create: [
            {
              tipo: "EFECTIVO_CONFIRMADO",
              detalle: { metodo: "EFECTIVO" },
            },
            {
              tipo: "PAGO_CONFIRMADO",
              detalle: { origen: "ADMIN_EFECTIVO" },
            },
          ],
        },
      },
    });

    await tx.inscripcion.update({
      where: { id: pagoActualizado.inscripcionId },
      data: { estadoPago: "PAGADA" },
    });

    return pagoActualizado;
  });

  return serializarPago(actualizado);
}

export async function crearSesionEpayco(id: string): Promise<CrearSesionEpaycoResponse> {
  const pago = await prisma.pago.findUnique({
    where: { id },
    include: { inscripcion: true },
  });
  if (pago === null) {
    throw new PagoNoEncontradoError("Pago no encontrado");
  }
  if (pago.estado === "PAGADO") {
    throw new PagoNoElegibleError("El pago ya está confirmado");
  }

  const config = obtenerConfiguracionEpayco();
  const token = await autenticarEpayco(config);
  const sessionId = await solicitarSesionEpayco(config, token, pago);

  await prisma.pago.update({
    where: { id },
    data: {
      metodo: "EPAYCO",
      estado: "EN_PROCESO",
      epaycoSessionId: sessionId,
      eventos: {
        create: {
          tipo: "SESION_EPAYCO_CREADA",
          detalle: { sessionId },
        },
      },
    },
  });

  return {
    pagoId: pago.id,
    sessionId,
    test: config.test,
  };
}

export async function procesarConfirmacionEpayco(payload: unknown): Promise<void> {
  const record = convertirARecord(payload);
  const confirmacion = normalizarConfirmacion(record);
  const config = obtenerConfiguracionEpayco();

  if (!validarFirma(confirmacion, config)) {
    await registrarEventoInvalido(confirmacion, record, "Firma inválida");
    throw new ConfirmacionInvalidaError("Firma inválida");
  }

  const pago = await buscarPagoConfirmacion(confirmacion);
  if (pago === null) {
    throw new PagoNoEncontradoError("Pago no encontrado");
  }

  if (!coincideMontoYMoneda(pago, confirmacion)) {
    await registrarEvento(pago.id, "WEBHOOK_INVALIDO", {
      motivo: "Monto o moneda no coincide",
      amount: confirmacion.amount,
      currency: confirmacion.currency,
    });
    throw new ConfirmacionInvalidaError("Monto o moneda no coincide");
  }

  await registrarEvento(pago.id, "WEBHOOK_RECIBIDO", detalleDesdeRecord(record));

  const estado = mapearEstadoEpayco(confirmacion.response);
  if (pago.estado === "PAGADO" || (pago.epaycoTransactionId === confirmacion.transactionId && pago.estado === estado)) {
    return;
  }

  await prisma.$transaction(async (tx): Promise<void> => {
    const dataBase = {
      epaycoRefPayco: confirmacion.xRefPayco,
      epaycoTransactionId: confirmacion.transactionId,
      epaycoResponse: confirmacion.response,
      epaycoFranchise: confirmacion.franchise,
    };

    if (estado === "PAGADO") {
      const pagoActualizado = await tx.pago.update({
        where: { id: pago.id },
        data: {
          ...dataBase,
          estado,
          fechaConfirmacion: new Date(),
          eventos: {
            create: {
              tipo: "PAGO_CONFIRMADO",
              detalle: {
                refPayco: confirmacion.refPayco,
                approvalCode: confirmacion.approvalCode,
                transactionDate: confirmacion.transactionDate,
              },
            },
          },
        },
      });
      await tx.inscripcion.update({
        where: { id: pagoActualizado.inscripcionId },
        data: { estadoPago: "PAGADA" },
      });
      return;
    }

    if (estado === "RECHAZADO" || estado === "FALLIDO") {
      await tx.pago.update({
        where: { id: pago.id },
        data: {
          ...dataBase,
          estado,
          eventos: {
            create: {
              tipo: estado === "RECHAZADO" ? "PAGO_RECHAZADO" : "PAGO_FALLIDO",
              detalle: {
                reason: confirmacion.responseReasonText,
                transactionState: confirmacion.transactionState,
              },
            },
          },
        },
      });
      return;
    }

    await tx.pago.update({
      where: { id: pago.id },
      data: {
        ...dataBase,
        estado: "EN_PROCESO",
      },
    });
  });
}

function crearReferenciaInterna(): string {
  return `INS-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function obtenerConfiguracionEpayco(): ConfiguracionEpayco {
  const publicKey = leerEnvObligatoria("EPAYCO_PUBLIC_KEY");
  const privateKey = leerEnvObligatoria("EPAYCO_PRIVATE_KEY");
  const customerId = leerEnvObligatoria("EPAYCO_CUSTOMER_ID");
  const pKey = leerEnvObligatoria("EPAYCO_P_KEY");
  const appPublicUrl = leerEnvObligatoria("APP_PUBLIC_URL").replace(/\/$/, "");
  const baseUrl = (process.env.EPAYCO_BASE_URL ?? DEFAULT_EPAYCO_BASE_URL).replace(/\/$/, "");
  const test = (process.env.EPAYCO_TEST ?? "true").toLowerCase() !== "false";

  return { publicKey, privateKey, customerId, pKey, test, baseUrl, appPublicUrl };
}

function leerEnvObligatoria(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value === "") {
    throw new ConfiguracionPagoError(`${name} es requerido para pagos`);
  }
  return value;
}

async function autenticarEpayco(config: ConfiguracionEpayco): Promise<string> {
  const credentials = Buffer.from(`${config.publicKey}:${config.privateKey}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
  });
  const body = await leerJson(response);
  if (!response.ok || !esEpaycoLoginResponse(body)) {
    throw new EpaycoError("No fue posible autenticar con ePayco");
  }
  return body.token;
}

async function solicitarSesionEpayco(
  config: ConfiguracionEpayco,
  token: string,
  pago: PagoConInscripcion,
): Promise<string> {
  const responseUrl = `${config.appPublicUrl}/pago/respuesta?pagoId=${encodeURIComponent(pago.id)}`;
  const confirmationUrl = `${config.appPublicUrl}/api/pagos/epayco/confirmacion`;
  const amount = Number(pago.monto.toString());
  const response = await fetch(`${config.baseUrl}/payment/session/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      checkout_version: "2",
      name: "Torneo SENA Gaming",
      currency: pago.moneda,
      amount,
      description: `Inscripción ${pago.inscripcion.juego}`,
      lang: "ES",
      country: "CO",
      invoice: pago.referenciaInterna,
      response: responseUrl,
      confirmation: confirmationUrl,
      method: "POST",
      uniqueTransactionPerBill: true,
      extras: {
        extra1: pago.id,
        extra2: pago.inscripcionId,
      },
      billing: {
        email: pago.inscripcion.correo ?? undefined,
        name: pago.inscripcion.nombreCompleto,
        numberDoc: pago.inscripcion.documento ?? undefined,
        callingCode: "+57",
        mobilePhone: pago.inscripcion.telefono ?? undefined,
      },
    }),
  });

  const body = await leerJson(response);
  if (!response.ok || !esEpaycoSessionResponse(body)) {
    throw new EpaycoError("No fue posible crear la sesión de ePayco");
  }
  return body.data.sessionId;
}

async function leerJson(response: Response): Promise<unknown> {
  return response.json().catch((): null => null);
}

function esObjeto(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function esEpaycoLoginResponse(value: unknown): value is EpaycoLoginResponse {
  return esObjeto(value) && typeof value.token === "string" && value.token.trim() !== "";
}

function esEpaycoSessionResponse(value: unknown): value is EpaycoSessionResponse {
  return (
    esObjeto(value) &&
    esObjeto(value.data) &&
    typeof value.data.sessionId === "string" &&
    value.data.sessionId.trim() !== ""
  );
}

function convertirARecord(payload: unknown): UnknownRecord {
  if (!esObjeto(payload)) {
    throw new ConfirmacionInvalidaError("Payload inválido");
  }
  return payload;
}

function leerCampo(record: UnknownRecord, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ConfirmacionInvalidaError(`Campo ${key} requerido`);
  }
  return value.trim();
}

function leerCampoOpcional(record: UnknownRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return null;
}

function normalizarConfirmacion(record: UnknownRecord): ConfirmacionEpayco {
  return {
    refPayco: leerCampoOpcional(record, "ref_payco") ?? leerCampo(record, "x_ref_payco"),
    xRefPayco: leerCampo(record, "x_ref_payco"),
    transactionId: leerCampo(record, "x_transaction_id"),
    response: leerCampo(record, "x_response"),
    responseReasonText: leerCampoOpcional(record, "x_response_reason_text"),
    amount: leerCampo(record, "x_amount"),
    currency: leerCampo(record, "x_currency_code"),
    franchise: leerCampoOpcional(record, "x_franchise"),
    signature: leerCampo(record, "x_signature"),
    approvalCode: leerCampoOpcional(record, "x_approval_code"),
    transactionDate: leerCampoOpcional(record, "x_transaction_date"),
    transactionState: leerCampoOpcional(record, "x_transaction_state"),
    paymentId: leerCampoOpcional(record, "x_extra1", "extra1"),
    internalReference: leerCampoOpcional(record, "x_id_invoice", "invoice"),
  };
}

function validarFirma(confirmacion: ConfirmacionEpayco, config: ConfiguracionEpayco): boolean {
  const expected = crypto
    .createHash("sha256")
    .update(
      `${config.customerId}^${config.pKey}^${confirmacion.xRefPayco}^${confirmacion.transactionId}^${confirmacion.amount}^${confirmacion.currency}`,
    )
    .digest("hex");
  if (expected.length !== confirmacion.signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(confirmacion.signature));
}

async function buscarPagoConfirmacion(confirmacion: ConfirmacionEpayco): Promise<Pago | null> {
  if (confirmacion.paymentId !== null) {
    const pagoPorId = await prisma.pago.findUnique({ where: { id: confirmacion.paymentId } });
    if (pagoPorId !== null) {
      return pagoPorId;
    }
  }
  if (confirmacion.internalReference !== null) {
    return prisma.pago.findUnique({
      where: { referenciaInterna: confirmacion.internalReference },
    });
  }
  return null;
}

function coincideMontoYMoneda(pago: Pago, confirmacion: ConfirmacionEpayco): boolean {
  const montoEsperado = Number(pago.monto.toString());
  const montoConfirmado = Number(confirmacion.amount);
  return montoEsperado === montoConfirmado && pago.moneda === confirmacion.currency;
}

function mapearEstadoEpayco(response: string): EstadoPago {
  if (response === "Aceptada") {
    return "PAGADO";
  }
  if (response === "Rechazada") {
    return "RECHAZADO";
  }
  if (response === "Fallida") {
    return "FALLIDO";
  }
  return "EN_PROCESO";
}

async function registrarEventoInvalido(
  confirmacion: ConfirmacionEpayco,
  record: UnknownRecord,
  motivo: string,
): Promise<void> {
  const pago = await buscarPagoConfirmacion(confirmacion);
  if (pago === null) {
    return;
  }
  await registrarEvento(pago.id, "WEBHOOK_INVALIDO", {
    motivo,
    payload: detalleDesdeRecord(record),
  });
}

async function registrarEvento(
  pagoId: string,
  tipo: TipoEventoPago,
  detalle: Prisma.InputJsonValue,
): Promise<void> {
  await prisma.eventoPago.create({
    data: {
      pagoId,
      tipo,
      detalle,
    },
  });
}

function detalleDesdeRecord(record: UnknownRecord): Prisma.InputJsonObject {
  const detalle: Record<string, Prisma.InputJsonValue> = {};
  Object.entries(record).forEach(([key, value]): void => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      detalle[key] = value;
    } else if (value !== undefined) {
      detalle[key] = String(value);
    }
  });
  return detalle;
}
