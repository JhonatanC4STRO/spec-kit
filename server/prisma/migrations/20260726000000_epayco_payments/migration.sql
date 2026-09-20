-- CreateEnum
CREATE TYPE "EstadoPagoInscripcion" AS ENUM ('PENDIENTE_PAGO', 'PAGADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('SIN_SELECCION', 'EPAYCO', 'EFECTIVO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'PAGADO', 'RECHAZADO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "TipoEventoPago" AS ENUM (
  'CREADO',
  'METODO_EFECTIVO',
  'SESION_EPAYCO_CREADA',
  'WEBHOOK_RECIBIDO',
  'WEBHOOK_INVALIDO',
  'PAGO_CONFIRMADO',
  'PAGO_RECHAZADO',
  'PAGO_FALLIDO',
  'EFECTIVO_CONFIRMADO'
);

-- AlterTable
ALTER TABLE "Inscripcion"
ADD COLUMN "estadoPago" "EstadoPagoInscripcion" NOT NULL DEFAULT 'PENDIENTE_PAGO';

-- CreateTable
CREATE TABLE "Pago" (
  "id" TEXT NOT NULL,
  "inscripcionId" TEXT NOT NULL,
  "monto" DECIMAL(10,2) NOT NULL,
  "moneda" TEXT NOT NULL DEFAULT 'COP',
  "metodo" "MetodoPago" NOT NULL DEFAULT 'SIN_SELECCION',
  "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
  "referenciaInterna" TEXT NOT NULL,
  "epaycoSessionId" TEXT,
  "epaycoRefPayco" TEXT,
  "epaycoTransactionId" TEXT,
  "epaycoResponse" TEXT,
  "epaycoFranchise" TEXT,
  "fechaConfirmacion" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoPago" (
  "id" TEXT NOT NULL,
  "pagoId" TEXT NOT NULL,
  "tipo" "TipoEventoPago" NOT NULL,
  "detalle" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EventoPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pago_inscripcionId_key" ON "Pago"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_referenciaInterna_key" ON "Pago"("referenciaInterna");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_epaycoTransactionId_key" ON "Pago"("epaycoTransactionId");

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_inscripcionId_fkey"
FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoPago" ADD CONSTRAINT "EventoPago_pagoId_fkey"
FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE CASCADE ON UPDATE CASCADE;
