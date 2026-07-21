-- Simplificación de la DB:
-- 1. Se elimina `EquipoCod` (tabla muerta: el equipo COD vive en `Inscripcion`).
-- 2. Se elimina `Administrador` (el admin se valida contra ADMIN_EMAIL/ADMIN_PASSWORD del entorno).
-- 3. Se eliminan las stats almacenadas de `GrupoParticipante`
--    (se calculan siempre desde los resultados de `PartidoGrupo`).

-- DropTable
DROP TABLE "EquipoCod";

-- DropTable
DROP TABLE "Administrador";

-- AlterTable
ALTER TABLE "GrupoParticipante"
  DROP COLUMN "puntos",
  DROP COLUMN "pj",
  DROP COLUMN "pg",
  DROP COLUMN "pe",
  DROP COLUMN "pp",
  DROP COLUMN "gf",
  DROP COLUMN "gc";
