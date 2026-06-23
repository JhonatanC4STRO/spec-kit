-- CreateEnum
CREATE TYPE "EstadoFaseGrupos" AS ENUM ('PENDIENTE', 'EN_CURSO', 'FINALIZADA');

-- CreateTable
CREATE TABLE "FaseGrupos" (
    "id" TEXT NOT NULL,
    "juego" "Juego" NOT NULL,
    "estado" "EstadoFaseGrupos" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaseGrupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL,
    "faseId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoParticipante" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "inscripcionId" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "pj" INTEGER NOT NULL DEFAULT 0,
    "pg" INTEGER NOT NULL DEFAULT 0,
    "pe" INTEGER NOT NULL DEFAULT 0,
    "pp" INTEGER NOT NULL DEFAULT 0,
    "gf" INTEGER NOT NULL DEFAULT 0,
    "gc" INTEGER NOT NULL DEFAULT 0,
    "clasificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GrupoParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartidoGrupo" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "jugadorAId" TEXT NOT NULL,
    "jugadorBId" TEXT NOT NULL,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "winnerId" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PartidoGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FaseGrupos_juego_key" ON "FaseGrupos"("juego");

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_faseId_fkey" FOREIGN KEY ("faseId") REFERENCES "FaseGrupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoParticipante" ADD CONSTRAINT "GrupoParticipante_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartidoGrupo" ADD CONSTRAINT "PartidoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
