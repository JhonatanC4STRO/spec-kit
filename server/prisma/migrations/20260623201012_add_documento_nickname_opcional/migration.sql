-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "documento" TEXT,
ALTER COLUMN "nickname" DROP NOT NULL,
ALTER COLUMN "nicknameNormalizado" DROP NOT NULL;
