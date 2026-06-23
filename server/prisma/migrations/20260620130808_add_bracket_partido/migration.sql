-- CreateEnum
CREATE TYPE "FormatoBracket" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION');

-- CreateEnum
CREATE TYPE "LadoBracket" AS ENUM ('WINNERS', 'LOSERS');

-- CreateTable
CREATE TABLE "Bracket" (
    "id" TEXT NOT NULL,
    "juego" "Juego" NOT NULL,
    "formato" "FormatoBracket" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "ronda" INTEGER NOT NULL,
    "lado" "LadoBracket",
    "jugadorAId" TEXT,
    "jugadorBId" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "penaltyScoreA" INTEGER,
    "penaltyScoreB" INTEGER,
    "winnerId" TEXT,
    "nextMatchId" TEXT,
    "nextLoserMatchId" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bracket_juego_key" ON "Bracket"("juego");

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
