-- Migrar EstadoInscripciones de fila global unica a una fila por juego.
ALTER TABLE "EstadoInscripciones" DROP CONSTRAINT IF EXISTS "EstadoInscripciones_pkey";
ALTER TABLE "EstadoInscripciones" ADD COLUMN "juego" "Juego";

-- La fila global existente se conserva como estado de FC25.
UPDATE "EstadoInscripciones" SET "juego" = 'FC25' WHERE "id" = 'global';

-- COD_BO2 nace abierto si no existia fila previa.
INSERT INTO "EstadoInscripciones" ("juego", "abierta", "updatedAt")
VALUES ('COD_BO2', true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

ALTER TABLE "EstadoInscripciones" ALTER COLUMN "juego" SET NOT NULL;
ALTER TABLE "EstadoInscripciones" DROP COLUMN "id";
ALTER TABLE "EstadoInscripciones" ADD CONSTRAINT "EstadoInscripciones_pkey" PRIMARY KEY ("juego");
