-- CreateEnum
CREATE TYPE "Juego" AS ENUM ('FC25', 'COD_BO2');

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "nicknameNormalizado" TEXT NOT NULL,
    "juego" "Juego" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoInscripciones" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "abierta" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstadoInscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_juego_nicknameNormalizado_key" ON "Inscripcion"("juego", "nicknameNormalizado");
