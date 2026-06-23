-- CreateTable
CREATE TABLE "EquipoCod" (
    "id" TEXT NOT NULL,
    "apodo" TEXT NOT NULL,
    "jugador1Id" TEXT NOT NULL,
    "jugador2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipoCod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EquipoCod_apodo_key" ON "EquipoCod"("apodo");
